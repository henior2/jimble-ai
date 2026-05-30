import { Composer } from 'grammy';
import { MessageRepo } from '../models/message';

export const bot = new Composer();

bot.on('message', async (ctx, next) => {
  await MessageRepo?.set([ctx.chatId, ctx.msgId], {
    assistant: false,
    firstName: ctx.from.first_name,
    replyTo: ctx.msg.reply_to_message?.message_id,
    text: ctx.msg.text?.replace(/^\/[^ ]+\b/, ''), // remove commands
  });
  await next();
});
