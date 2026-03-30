import { UserRepo } from '@telegram/models/user';
import { Composer } from 'grammy';
import type { BotCommand } from 'grammy/types';

export const commands: BotCommand[] = [
  // { command: 'a', description: 'Preffered model A' },
  // { command: 'b', description: 'Preffered model B' },
  // { command: 'c', description: 'Preffered model C' },
  // { command: 'set', description: 'Set preferred model a, b or c' },
  { command: 'search', description: 'Toggle web search' },
];

export const bot = new Composer();

bot.command('search', async (ctx) => {
  if (!ctx.from?.id || !UserRepo) return;
  const user = UserRepo.get(ctx.from.id);
  user.preferences.search = !user.preferences.search;

  await ctx.reply(
    `Web search for models has been turned <b>${user.preferences.search ? 'on' : 'off'}</b>.`,
    { parse_mode: 'HTML' },
  );

  UserRepo.set(ctx.from.id, user);
});

// TODO implement set preferred model command
// TODO implement prompt commands
