import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  type ChatInputCommandInteraction,
  MessageFlags,
  SlashCommandBuilder,
} from 'discord.js';
import OpenAI from 'openai';
import { abortResponse, getResponse } from '@/ai';
import config from '@/config';
import { discord as log } from '@/lib/log';
import { preferredBinds } from '@/types';
import { ChatRepo } from '../models/chat';
import { type User, UserRepo } from '../models/user';
import type { Command } from '../types';

async function respond(
  interaction: ChatInputCommandInteraction,
  user: User,
  model: string,
) {
  if (!UserRepo || !ChatRepo) return;

  const guildId = interaction.guildId;
  const chatKey = guildId ? ChatRepo.get(guildId).key : '';
  const key = chatKey || user.key;

  if (!key) {
    await interaction.reply({
      content:
        'API key is not set. Please set it first with `/setmykey` or `/setkey`.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const promptText = interaction.options.getString('prompt', true).trim();
  const sanitizedName =
    interaction.user.username.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64) ||
    'user';

  const stopButton = new ButtonBuilder()
    .setCustomId('stopAIRequest')
    .setLabel('Stop')
    .setStyle(ButtonStyle.Danger);

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(stopButton);

  await interaction.reply({
    content: 'Processing...',
    components: [row],
  });
  const reply = await interaction.fetchReply();

  const input: OpenAI.ChatCompletionMessageParam[] = [
    {
      role: 'user',
      content: promptText,
      name: sanitizedName,
    },
  ];

  let messageText = '';
  let lastEdit = 0;
  const EDIT_INTERVAL = 1000;

  try {
    const stream = await getResponse(
      key,
      model,
      input,
      user.preferences.search,
      reply.id,
    );

    for await (const chunk of stream) {
      abortResponse.get(reply.id)?.signal.throwIfAborted();
      const content = chunk.choices[0]?.delta.content;
      const finish_reason = chunk.choices[0]?.finish_reason;

      if (finish_reason && finish_reason !== 'stop') {
        messageText += `[${finish_reason}]`;
      }

      if (finish_reason) {
        log.debug(
          chunk.usage?.completion_tokens,
          chunk.usage?.completion_tokens_details?.reasoning_tokens,
        );

        await interaction
          .editReply({
            content: messageText.slice(0, 2000) || ' ',
            components: [],
          })
          .catch((err) => log.error('Final response edit failed:', err));
        break;
      }

      if (content) {
        messageText += content;
        const now = Date.now();
        if (now - lastEdit < EDIT_INTERVAL) {
          continue;
        }
        lastEdit = now;

        await interaction
          .editReply({
            content: `${messageText}...`.slice(0, 2000),
            components: [row],
          })
          .catch((err) => log.error('Response edit failed:', err));
      }
    }
  } catch (error) {
    if (
      error === 'AbortedByUser' ||
      (error instanceof Error && error.name === 'AbortError')
    ) {
      await interaction
        .editReply({
          content: messageText
            ? messageText.slice(0, 2000)
            : 'Request stopped.',
          components: [],
        })
        .catch(() => {});
    } else if (error instanceof OpenAI.APIError) {
      await interaction
        .editReply({
          content: `Error:\n\`\`\`\n${error.message}\n\`\`\``,
          components: [],
        })
        .catch(() => {});
    } else {
      log.error('Stream processing error:', error);
      await interaction
        .editReply({
          content: 'An unexpected error occurred.',
          components: [],
        })
        .catch(() => {});
    }
  } finally {
    abortResponse.delete(reply.id);
  }
}

export const commands: Command[] = [];

// Register preferred binds commands
for (const bind of preferredBinds) {
  commands.push({
    data: new SlashCommandBuilder()
      .setName(bind.toLowerCase())
      .setDescription(`Prompt preferred model ${bind}`)
      .addStringOption((option) =>
        option
          .setName('prompt')
          .setDescription('The prompt to send to the model')
          .setRequired(true),
      ),
    async execute(interaction) {
      if (!UserRepo || !ChatRepo) {
        await interaction.reply({
          content: 'Server side error.',
          flags: MessageFlags.Ephemeral,
        });
        return;
      }

      const user = UserRepo.get(interaction.user.id);
      const model = user.preferences.models[bind];
      if (!model) {
        await interaction.reply({
          content: `Bind \`/${bind}\` is unset. Set it first with \`/set bind:${bind} model:<model_name>\`.`,
          flags: MessageFlags.Ephemeral,
        });
        return;
      }

      await respond(interaction, user, model);
    },
  });
}

// Register config binds commands
for (const { bind, model } of config.ai.binds) {
  commands.push({
    data: new SlashCommandBuilder()
      .setName(bind.toLowerCase())
      .setDescription(`Prompt model ${model}`)
      .addStringOption((option) =>
        option
          .setName('prompt')
          .setDescription('The prompt to send to the model')
          .setRequired(true),
      ),
    async execute(interaction) {
      if (!UserRepo || !ChatRepo) {
        await interaction.reply({
          content: 'Server side error.',
          flags: MessageFlags.Ephemeral,
        });
        return;
      }

      const user = UserRepo.get(interaction.user.id);
      await respond(interaction, user, model);
    },
  });
}
