import { open } from 'lmdb';
import config from '@/config';

export const telegram = config.telegram.token
  ? open('./data/telegram', { compression: true })
  : null;

export const telegramMessages = config.telegram.storeMessages
  ? open('./data/telegram-msg', { compression: true })
  : null;
