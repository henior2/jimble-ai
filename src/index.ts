import * as telegramBot from '@/bots/telegram';
import config from './config';
import { core as log } from '@/lib/log';

let bots = 0;

if (config.telegram.token) {
  telegramBot.create(config.telegram.token).start();
  log.ok('Telegram bot started');
  bots++;
}

if (bots < 1) {
  log.error('No bot is running');
}
