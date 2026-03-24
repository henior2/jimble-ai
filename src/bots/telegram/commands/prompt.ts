import { Composer } from 'grammy';
import type { BotCommand } from 'grammy/types';

export const commands: BotCommand[] = [
  // { command: 'a', description: 'Preffered model A' },
  // { command: 'b', description: 'Preffered model B' },
  // { command: 'c', description: 'Preffered model C' },
  // { command: 'set', description: 'Set preferred model a, b or c' },
  // { command: 'search', description: 'Toggle web search' },
];

export const bot = new Composer();

// TODO implement search toggle command
// TODO implement set preferred model command
// TODO implement prompt commands
