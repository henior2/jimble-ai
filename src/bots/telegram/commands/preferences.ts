import {
  type Conversation,
  type ConversationFlavor,
  createConversation,
} from '@grammyjs/conversations';
import { Composer, type Context } from 'grammy';
import type { BotCommand } from 'grammy/types';
import { telegram as log } from '@/lib/log';
import { modelRegex } from '@/lib/regex';
import { type PreferredBinds, preferredBinds } from '@/types';
import { UserRepo } from '../models/user';

export const commands: BotCommand[] = [
  {
    command: 'set',
    description: `Set preferred model ${preferredBinds.join(', ')}`,
  },
  {
    command: 'models',
    description: `Get preferred models ${preferredBinds.join(', ')}`,
  },
  { command: 'search', description: 'Toggle web search' },
];
export const bot = new Composer<ConversationFlavor<Context>>();

bot.command('search', async (ctx) => {
  if (!ctx.from?.id || !UserRepo) return;
  const user = UserRepo.get(ctx.from.id);
  user.preferences.search = !user.preferences.search;

  await ctx.reply(
    `Web search for models has been turned <b>${user.preferences.search ? 'on' : 'off'}</b>.`,
    { parse_mode: 'HTML' },
  );

  UserRepo.set(ctx.from.id, user);
});

async function setPreferred(
  conversation: Conversation,
  ctx: Context,
  bind: PreferredBinds,
) {
  await ctx.reply(`Enter the model identifier for command /${bind}:`);

  const { message } = await conversation.waitFor('message:text');
  const identifier = message.text.trim();

  if (!identifier || !modelRegex.test(identifier)) {
    await ctx.reply('Please enter a valid model identifier.');
    return;
  }

  await conversation.external(async () => {
    if (!ctx.from?.id || !UserRepo) return;
    const user = UserRepo.get(ctx.from.id);

    user.preferences.models = {
      ...user.preferences.models,
      [bind]: identifier,
    };

    await UserRepo.set(ctx.from.id, user);
  });

  await ctx.reply(
    `Bind has been set. You can now use /${bind} to prompt model <code>${identifier}</code>`,
    { parse_mode: 'HTML' },
  );
}

bot.use(createConversation(setPreferred));

bot.command('set', async (ctx) => {
  const bind = ctx.match.trim() as PreferredBinds;
  if (!preferredBinds.includes(bind)) {
    await ctx.reply(
      `Invalid bind. Use ${preferredBinds.join(', ')}\neg. /set ${preferredBinds[0]}`,
    );

    return;
  }

  await ctx.conversation.enter('setPreferred', bind);
});

bot.command('models', async (ctx) => {
  if (!ctx.from?.id || !UserRepo) return;
  const models = UserRepo.get(ctx.from.id).preferences.models;
  const modelsInfo = Object.keys(models).map(
    (bind) =>
      `/${bind} - <code>${models[bind as PreferredBinds] ?? 'none'}</code>`,
  );

  await ctx.reply(['Your preferred model binds:', ...modelsInfo].join('\n'), {
    parse_mode: 'HTML',
  });
});

bot.command('getuser', (ctx) => {
  if (!ctx.from?.id || !UserRepo) return;
  log.debug(JSON.stringify(UserRepo.get(ctx.from.id)));
});
