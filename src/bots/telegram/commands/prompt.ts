import { Composer } from 'grammy';
import type { BotCommand } from 'grammy/types';

export const commands: BotCommand[] = [
  // { command: 'a', description: 'Preffered model A' },
  // { command: 'b', description: 'Preffered model B' },
  // { command: 'c', description: 'Preffered model C' },
];

export const bot = new Composer();

// TODO implement prompt commands
