import { open } from 'lmdb';
import config from '@/config';

export const discord = config.discord.token
  ? open('./data/discord', { compression: true })
  : null;
