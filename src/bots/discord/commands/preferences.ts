import {
  MessageFlags,
  SlashCommandBuilder,
} from 'discord.js';
import { modelRegex } from '@/lib/regex';
import { type PreferredBinds, preferredBinds } from '@/types';
import { UserRepo } from '../models/user';
import type { Command } from '../types';

const set: Command = {
  data: new SlashCommandBuilder()
    .setName('set')
    .setDescription('Set preferred model bind')
    .addStringOption((option) =>
      option
        .setName('bind')
        .setDescription('The preferred bind to configure')
        .setRequired(true)
        .addChoices(
          ...preferredBinds.map((bind) => ({ name: bind, value: bind })),
        ),
    )
    .addStringOption((option) =>
      option
        .setName('model')
        .setDescription('The model identifier (eg. google/gemini-2.5-flash)')
        .setRequired(true),
    ),
  async execute(interaction) {
    if (!UserRepo) return;
    const bind = interaction.options.getString('bind', true) as PreferredBinds;
    const identifier = interaction.options.getString('model', true).trim();

    if (!modelRegex.test(identifier)) {
      await interaction.reply({
        content: 'Please enter a valid model identifier.',
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const user = UserRepo.get(interaction.user.id);
    user.preferences.models = {
      ...user.preferences.models,
      [bind]: identifier,
    };
    await UserRepo.set(interaction.user.id, user);

    await interaction.reply({
      content: `Bind has been set. You can now use bind \`${bind}\` to prompt model \`${identifier}\`.`,
      flags: MessageFlags.Ephemeral,
    });
  },
};

const models: Command = {
  data: new SlashCommandBuilder()
    .setName('models')
    .setDescription('Get preferred models'),
  async execute(interaction) {
    if (!UserRepo) return;
    const userModels = UserRepo.get(interaction.user.id).preferences.models;
    const modelsInfo = Object.keys(userModels).map(
      (bind) =>
        `**/${bind}** - \`${userModels[bind as PreferredBinds] ?? 'none'}\``,
    );

    await interaction.reply({
      content:
        modelsInfo.length > 0
          ? ['Your preferred model binds:', ...modelsInfo].join('\n')
          : 'You have no preferred model binds set.',
      flags: MessageFlags.Ephemeral,
    });
  },
};

const search: Command = {
  data: new SlashCommandBuilder()
    .setName('search')
    .setDescription('Set web search')
    .addBooleanOption((option) =>
      option
        .setName('search')
        .setDescription('Enable web search')
        .setRequired(true),
    ),
  async execute(interaction) {
    if (!UserRepo) return;
    const user = UserRepo.get(interaction.user.id);
    const search = interaction.options.getBoolean('search', true);
    user.preferences.search = search;
    await UserRepo.set(interaction.user.id, user);

    await interaction.reply({
      content: `Web search for models has been turned **${user.preferences.search ? 'on' : 'off'}**.`,
      flags: MessageFlags.Ephemeral,
    });
  },
};

export const commands: Command[] = [set, models, search];
