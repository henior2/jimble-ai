import {
  type ConversationFlavor,
  conversations,
} from '@grammyjs/conversations';
import { Bot, type Context } from 'grammy';
import type { BotCommand } from 'grammy/types';
import config from '@/config';
import { telegram as log } from '@/lib/log';
import * as prompt from './commands/prompt';
import * as setKey from './commands/setkey';

const commands: BotCommand[] = [
  { command: 'start', description: 'Start the bot' },

  ...prompt.commands,
  ...setKey.commands,
];

export function create(token: string) {
  const bot = new Bot<ConversationFlavor<Context>>(token);
  bot.use(conversations());

  bot.api.setMyCommands(commands);

  if (config.debug) {
    bot.use(async (ctx, next) => {
      const text = ctx.message?.text ?? '';
      const preview = text.slice(0, 32) + (text.length > 32 ? '...' : '');

      log.debug(ctx.from?.username, '=>', preview);
      await next();
    });
  }

  bot.command('start', async (ctx) => {
    await ctx.reply('Set your OpenRouter API key with /setmykey.');
  });

  bot.use(prompt.bot);
  bot.use(setKey.bot);

  bot.catch((err) => {
    console.error('Telegram bot error: ', err);
  });

  return bot;
}
