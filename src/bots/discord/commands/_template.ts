import { SlashCommandBuilder } from 'discord.js';
import type { Command } from '../types';

const _name: Command = {
  data: new SlashCommandBuilder().setName('_name').setDescription('_desc'),
  async execute(_interaction) {},
};

export const commands: Command[] = [];
