import { Bot } from 'grammy';
import { config } from '@/config';

const bot = new Bot(config.telegram.token ?? '');

const commands: { command: string; description: string }[] = [
  { command: 'start', description: 'Start the bot' },
  { command: 'a', description: 'Preffered model A' },
  { command: 'b', description: 'Preffered model B' },
  { command: 'c', description: 'Preffered model C' },
  { command: 'set', description: 'Set preferred model a, b or c' },
  { command: 'search', description: 'Toggle web search' },

  { command: 'id', description: 'Show ID of current chat' },
  { command: 'setkey', description: 'Set API key for specified chat ID' },
  { command: 'setmykey', description: 'Set API key for yourself' },
  { command: 'unsetkey', description: 'Unset API key for specified chat ID' },
  { command: 'unsetmykey', description: 'Unset API key for yourself' },
];

bot.command('start', async (ctx) => {
  bot.api.setMyCommands(commands);
  await ctx.reply('Set your OpenRouter API key with /setmykey.');
});


bot.catch((err) => {
  console.error('Bot error:', err);
});

export { bot as telegramBot };
