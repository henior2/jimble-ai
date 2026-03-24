import { Composer } from 'grammy';
import type { BotCommand } from 'grammy/types';

export const commands: BotCommand[] = [
  // { command: 'setkey', description: 'Set API key for specified chat ID' },
  // { command: 'setmykey', description: 'Set API key for yourself' },
  // { command: 'unsetkey', description: 'Unset API key for specified chat ID' },
  // { command: 'unsetmykey', description: 'Unset API key for yourself' },
];

export const bot = new Composer();

bot.command('id', async (ctx) => {
  await ctx.reply(`Current chat ID:\n<pre>${ctx.chat.id}</pre>`, {
    parse_mode: 'HTML',
  });
});

// TODO implement setkey commands
