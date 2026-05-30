import {
  type ConversationFlavor,
  conversations,
} from '@grammyjs/conversations';
import { run, sequentialize } from '@grammyjs/runner';
import { Bot, type Context } from 'grammy';
import type { BotCommand } from 'grammy/types';
import * as onMessage from './commands/onmessage';
import * as preferences from './commands/preferences';
import * as prompt from './commands/prompt';
import * as setKey from './commands/setkey';

const commands: BotCommand[] = [
  { command: 'start', description: 'Start the bot' },

  ...prompt.commands,
  ...preferences.commands,
  ...setKey.commands,
];

export function create(token: string) {
  const bot = new Bot<ConversationFlavor<Context>>(token);
  // bot.use(sequentialize((ctx) => ctx.chat?.id.toString()));
  bot.use(conversations());

  bot.api.setMyCommands(commands);

  // if (config.debug) {
  //   bot.use(async (ctx, next) => {
  //     const text = ctx.message?.text ?? '';
  //     const preview = text.slice(0, 32) + (text.length > 32 ? '...' : '');

  //     log.debug(ctx.from?.username, '=>', preview);
  //     await next();
  //   });
  // }

  bot.command('start', async (ctx) => {
    await ctx.reply('Set your OpenRouter API key with /setmykey.');
  });

  bot.use(onMessage.bot);
  bot.use(prompt.bot);
  bot.use(preferences.bot);
  bot.use(setKey.bot);

  bot.catch((err) => {
    console.error('Telegram bot error: ', err);
  });

  return bot;
}

export function runSafe(bot: Bot | Bot<ConversationFlavor<Context>>) {
  const runner = run(bot);

  // Stopping the bot when the Node.js process
  // is about to be terminated
  const stopRunner = () => runner.isRunning() && runner.stop();
  process.once('SIGINT', stopRunner);
  process.once('SIGTERM', stopRunner);
}
