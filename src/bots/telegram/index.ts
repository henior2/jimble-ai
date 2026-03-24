import { Bot } from 'grammy';
import type { BotCommand } from 'grammy/types';

import * as prompt from './commands/prompt';
import * as setKey from './commands/setkey';

const commands: BotCommand[] = [
  { command: 'start', description: 'Start the bot' },

  ...prompt.commands,
  ...setKey.commands,
];

export function create(token: string) {
  const bot = new Bot(token);

  bot.api.setMyCommands(commands);

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
