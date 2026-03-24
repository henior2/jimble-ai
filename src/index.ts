import * as telegramBot from '@/bots/telegram';
import config from './config';

let bots = 0;

if (config.telegram.token) {
  telegramBot.create(config.telegram.token).start();
  bots++;
}

if (bots < 1) {
  throw Error('No bot is running');
}
