import * as telegramBot from '@/bots/telegram';
import { core as log } from '@/lib/log';
import config from './config';

let bots = 0;

if (config.telegram.token) {
  const bot = telegramBot.create(config.telegram.token);
  telegramBot.runSafe(bot);
  log.ok('Telegram bot started');
  bots++;
}

if (bots < 1) {
  log.error('No bot is running');
}
