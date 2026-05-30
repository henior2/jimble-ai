import {
  type CommandContext,
  Composer,
  type Context,
  InlineKeyboard,
} from 'grammy';
import type { BotCommand } from 'grammy/types';
import OpenAI from 'openai';
import { convert } from 'telegram-markdown-v2';
import { abortResponse, getResponse } from '@/ai';
import config from '@/config';
import { telegram as log } from '@/lib/log';
import { preferredBinds } from '@/types';
import { ChatRepo } from '../models/chat';
import { MessageRepo, type StoredMessage } from '../models/message';
import { type User, UserRepo } from '../models/user';

export const commands: BotCommand[] = [
  ...preferredBinds.map((bind) => ({
    command: bind,
    description: `Preferred model ${bind}`,
  })),

  ...config.ai.binds.map(({ bind, model }) => ({
    command: bind,
    description: `Model ${model}`,
  })),
];

export const bot = new Composer();

function getReplyChain(chatId: number, messageId: number) {
  if (!MessageRepo) return;
  const messages: StoredMessage[] = [];
  let last: StoredMessage = MessageRepo.get([chatId, messageId]);

  messages.push(last);

  while (last.replyTo) {
    last = MessageRepo.get([chatId, last.replyTo]);
    messages.push(last);
  }

  return messages.map<OpenAI.ChatCompletionMessageParam>((msg) => {
    const sanitizedName = msg.firstName
      .replace(/[^a-zA-Z0-9_-]/g, '')
      .slice(0, 64);

    // Fallback to empty string if text is undefined, as OpenAI expects 'content'
    const content = msg.text ?? '';

    if (msg.assistant) {
      return {
        role: 'assistant',
        name: sanitizedName,
        content: content,
      };
    } else {
      return {
        role: 'user',
        name: sanitizedName,
        content: content,
      };
    }
  });
}

bot.command('context', async (ctx) => {
  const messages = getReplyChain(ctx.chatId, ctx.msgId);
  await ctx.reply(JSON.stringify(messages));
});

bot.callbackQuery('stopAIRequest', (ctx) => {
  if (!ctx.msgId) return;
  const controller = abortResponse.get(ctx.msgId);
  abortResponse.delete(ctx.msgId);
  controller?.abort('AbortedByUser');
});

async function respond(
  ctx: CommandContext<Context>,
  user: User,
  model: string,
) {
  if (!ctx.from?.id || !UserRepo || !ChatRepo) return;
  const key = ChatRepo.get(ctx.chatId).key || user.key;

  if (!key) {
    await ctx.reply(
      `API key is not set. Please set it first with /setmykey or /setkey.`,
      {
        reply_parameters: { message_id: ctx.msgId },
      },
    );
    return;
  }

  const stopButton = new InlineKeyboard().text('Stop', 'stopAIRequest');
  const input = getReplyChain(ctx.chatId, ctx.msgId) ?? [
    {
      role: 'user',
      content: ctx.match,
      name: ctx.from.first_name,
    },
  ];

  try {
    const start = Date.now();
    log.debug('sending');

    const reply = await ctx.reply('Processing...', {
      reply_parameters: { message_id: ctx.msgId },
      reply_markup: stopButton,
    });

    const stream = await getResponse(
      key,
      model,
      input.toReversed(),
      user.preferences.search,
      reply.message_id,
    );

    let messageText = '';
    let lastEdit = 0;
    const EDIT_INTERVAL = 1000;

    for await (const chunk of stream) {
      abortResponse.get(reply.message_id)?.signal.throwIfAborted();
      const content = chunk.choices[0]?.delta.content;

      const finish_reason = chunk.choices[0]?.finish_reason;

      if (finish_reason && finish_reason !== 'stop') {
        messageText += `[${finish_reason}]`;
      }

      if (finish_reason) {
        log.debug(
          chunk.usage?.completion_tokens,
          chunk.usage?.completion_tokens_details?.reasoning_tokens,
        );

        await ctx.api
          .editMessageText(
            ctx.chat.id,
            reply.message_id,
            convert(messageText, 'escape'),
            {
              reply_markup: undefined,
              parse_mode: 'MarkdownV2',
            },
          )
          .catch((err) => log.error('Final response edit failed:', err));
        break;
      }

      if (content) {
        messageText += content;
        const now = Date.now();
        if (now - lastEdit < EDIT_INTERVAL) {
          continue;
        }
        lastEdit = now;

        await ctx.api
          .editMessageText(
            ctx.chat.id,
            reply.message_id,
            convert(`${messageText}...`, 'escape'),
            {
              reply_markup: stopButton,
              parse_mode: 'MarkdownV2',
            },
          )
          .catch((err) => log.error('Response edit failed:', err));
      }
    }

    log.debug(
      'took',
      Date.now() - start,
      'ms',
      // completion.usage?.prompt_tokens,
      // '+',
      // completion.usage?.completion_tokens_details?.reasoning_tokens,
      // completion.usage?.completion_tokens,
      // 'tokens',
    );

    await MessageRepo?.set([ctx.chatId, reply.message_id], {
      assistant: true,
      firstName: reply.from?.first_name ?? 'bot',
      replyTo: ctx.msgId,
      text: messageText,
    });
  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      await ctx.reply(`Error:\n<pre>${error.message}</pre>`, {
        parse_mode: 'HTML',
      });
    } else if (
      (error instanceof OpenAI.APIError && error.code === '') ||
      error === 'AbortedByUser'
    ) {
      ctx.reply('Request stopped.');
    } else {
      throw error;
    }
  }
}

for (const bind of preferredBinds) {
  bot.command(bind, async (ctx) => {
    if (!ctx.from?.id || !UserRepo || !ChatRepo) return;

    const user = UserRepo.get(ctx.from.id);
    if (!user.preferences.models[bind]) {
      await ctx.reply(
        `Bind /${bind} is unset. Set it first with /set ${bind}`,
        { reply_parameters: { message_id: ctx.msgId } },
      );
      return;
    }

    ctx.replyWithChatAction('typing');
    await respond(ctx, user, user.preferences.models[bind]);
  });
}

for (const { bind, model } of config.ai.binds) {
  bot.command(bind, async (ctx) => {
    if (!ctx.from?.id || !UserRepo) return;
    const user = UserRepo.get(ctx.from.id);

    ctx.replyWithChatAction('typing');
    await respond(ctx, user, model);
  });
  log.ok(`Registered bind /${bind} => ${model}`);
}
