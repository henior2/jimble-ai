import { config } from '@/config';

if (config.telegram.token !== undefined) {
  const { telegramBot } = await import('@/bots/telegram');
  telegramBot.start();
}
