import {
  type Conversation,
  type ConversationFlavor,
  createConversation,
} from '@grammyjs/conversations';
import { Composer, type Context } from 'grammy';
import type { BotCommand } from 'grammy/types';
import { telegram as log } from '@/lib/log';
import { UserRepo } from '../models/user';

export const commands: BotCommand[] = [
  { command: 'id', description: 'Get current chat ID' },
  { command: 'setmykey', description: 'Set API key for yourself' },
  { command: 'setkey', description: 'Set API key for specified chat ID' },
  { command: 'unsetmykey', description: 'Unset API key for yourself' },
  { command: 'unsetkey', description: 'Unset API key for specified chat ID' },
];

export const bot = new Composer<ConversationFlavor<Context>>();

bot.command('id', async (ctx) => {
  await ctx.reply(`Current chat ID:\n<pre>${ctx.chat.id}</pre>`, {
    parse_mode: 'HTML',
  });
});

async function setMyKey(conversation: Conversation, ctx: Context) {
  await ctx.reply('Enter your OpenRouter API key:');

  const { message } = await conversation.waitFor('message:text');
  const key = message.text.trim();

  if (!key) return;

  conversation.external(() => UserRepo?.patch(message.from.id, { key }));
  await ctx.reply(
    'API key has been set. You can now use it in direct chat with bot or in any group.',
  );
}

async function setKey(
  conversation: Conversation,
  ctx: Context,
  chatID: number,
) {
  await ctx.reply(
    `Enter OpenRouter API key for chat ID <code>${chatID}</code>:`,
    { parse_mode: 'HTML' },
  );

  const { message } = await conversation.waitFor('message:text');
  const key = message.text.trim();

  if (!key) return;

  conversation.external(() => UserRepo?.patch(chatID, { key }));
  await ctx.reply(
    `API key has been set. It will now be used in chat <code>${chatID}</code>.`,
    { parse_mode: 'HTML' },
  );
}

bot.use(createConversation(setMyKey));
bot.use(createConversation(setKey));

async function checkIfAdmin(ctx: Context, chatID: number) {
  if (ctx.chat?.type === 'private') return true;

  const admin = await ctx.api.getChatMember(chatID, ctx.from?.id ?? 0);

  if (admin?.status in ['administrator', 'creator']) {
    return true;
  }

  await ctx.reply('You are not an admin on this chat.');
  return false;
}

bot.command('setmykey', async (ctx) => {
  await ctx.conversation.enter('setMyKey');
});

bot.command('setkey', async (ctx) => {
  const chatID = parseInt(ctx.match, 10);
  if (Number.isNaN(chatID)) {
    await ctx.reply('Specify valid chat ID: /setkey <chat ID>');
    return;
  }
  if (!checkIfAdmin(ctx, chatID)) return;

  await ctx.conversation.enter('setKey', chatID);
});

bot.command('unsetmykey', async (ctx) => {
  UserRepo?.patch(ctx.from?.id ?? 0, { key: '' });
  await ctx.reply('Your key has been unset.');
});

bot.command('unsetkey', async (ctx) => {
  const chatID = parseInt(ctx.match, 10);
  if (Number.isNaN(chatID)) {
    await ctx.reply('Specify valid chat ID: /unsetkey <chat ID>');
    return;
  }
  if (!checkIfAdmin(ctx, chatID)) return;

  UserRepo?.patch(chatID, { key: '' });
  await ctx.reply('The key has been unset.');
});

bot.command('getkey', (ctx) => {
  let chatID = parseInt(ctx.match, 10);
  chatID = Number.isNaN(chatID) ? (ctx.from?.id ?? 0) : chatID;
  log.debug(UserRepo?.get(chatID).key);
});
