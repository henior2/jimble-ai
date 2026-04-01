import { Composer } from 'grammy';
import type { BotCommand } from 'grammy/types';
import { preferredBinds } from '@/types';

export const commands: BotCommand[] = [
  ...preferredBinds.map((bind) => ({
    command: bind,
    description: `Preferred model ${bind}`,
  })),
];

export const bot = new Composer();

// TODO implement prompt commands
