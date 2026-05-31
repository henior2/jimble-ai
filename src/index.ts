// import discordBot from '@/bots/discord';
// import telegramBot from '@/bots/telegram';

import { core as log } from '@/lib/log';
import config from './config';

let bots = 0;

if (config.telegram.token) {
  const { create, runSafe } = await import('@/bots/telegram');

  const bot = create(config.telegram.token);
  runSafe(bot);
  log.ok('Telegram bot started');
  bots++;
}

if (config.discord.token) {
  const { client } = await import('@/bots/discord');

  client.login(config.discord.token);
  log.ok('Discord bot started');
  bots++;
}

if (bots < 1) {
  log.error('No bot is running');
}
