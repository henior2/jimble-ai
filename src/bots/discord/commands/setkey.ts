import {
  InteractionContextType,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from 'discord.js';
import { ChatRepo } from '../models/chat';
import { UserRepo } from '../models/user';
import type { Command } from '../types';

const setMyKey: Command = {
  data: new SlashCommandBuilder()
    .setName('setmykey')
    .setDescription('Set API key for yourself')
    .addStringOption((option) =>
      option
        .setName('key')
        .setDescription('Your OpenRouter/OpenAI-compatible API key')
        .setRequired(true),
    ),
  async execute(interaction) {
    const key = interaction.options.getString('key', true);
    await UserRepo?.patch(interaction.user.id, { key });
    await interaction.reply({
      content:
        'API key has been set. You can now use it in direct chat with bot or in any group.',
      flags: MessageFlags.Ephemeral,
    });
  },
};

const setKey: Command = {
  data: new SlashCommandBuilder()
    .setName('setkey')
    .setDescription('Set API key for this server')
    .addStringOption((option) =>
      option
        .setName('key')
        .setDescription('Your OpenRouter/OpenAI-compatible API key')
        .setRequired(true),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setContexts([InteractionContextType.Guild]),
  async execute(interaction) {
    const key = interaction.options.getString('key', true);
    await ChatRepo?.set(interaction.guildId ?? '', { key });
    await interaction.reply({
      content:
        'API key has been set. **Any user** in this server can now use it.',
      flags: MessageFlags.Ephemeral,
    });
  },
};

const unsetMyKey: Command = {
  data: new SlashCommandBuilder()
    .setName('unsetmykey')
    .setDescription('Unset API key for yourself'),
  async execute(interaction) {
    await UserRepo?.patch(interaction.user.id, { key: '' });
    await interaction.reply({
      content: 'Your key has been unset.',
      flags: MessageFlags.Ephemeral,
    });
  },
};

const unsetKey: Command = {
  data: new SlashCommandBuilder()
    .setName('unsetkey')
    .setDescription('Unset API key for this server')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setContexts([InteractionContextType.Guild]),
  async execute(interaction) {
    await ChatRepo?.delete(interaction.guildId ?? '');
    await interaction.reply({
      content: 'The key has been unset.',
      flags: MessageFlags.Ephemeral,
    });
  },
};

export const commands: Command[] = [setMyKey, setKey, unsetMyKey, unsetKey];
