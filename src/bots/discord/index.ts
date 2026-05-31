import {
  Client,
  Collection,
  Events,
  InteractionContextType,
  MessageFlags,
} from 'discord.js';
import { discord as log } from '@/lib/log';
import * as preferences from './commands/preferences';
import * as setKey from './commands/setkey';
import type { Command } from './types';

const client = new Client({
  intents: [
    // GatewayIntentBits.Guilds,
    // GatewayIntentBits.GuildMessages,
    // GatewayIntentBits.MessageContent,
  ],
});

const commands = [...setKey.commands, ...preferences.commands];

const commandsCollection = new Collection<string, Command>();
for (const command of commands) {
  commandsCollection.set(command.data.name, command);
}

client.once(Events.ClientReady, async (client) => {
  log.ok('Logged in as', client.user.tag);

  await client.application.commands.set(
    commands.map((command) => {
      // inject default contexts
      if (!command.data.contexts) {
        command.data.setContexts([
          InteractionContextType.Guild,
          InteractionContextType.BotDM,
          InteractionContextType.PrivateChannel,
        ]);
      }

      return command.data;
    }),
  );
  log.ok('Registered commands');
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  const command = commandsCollection.get(interaction.commandName);
  if (!command) {
    log.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: 'There was an error while executing this command!',
        flags: MessageFlags.Ephemeral,
      });
    } else {
      await interaction.reply({
        content: 'There was an error while executing this command!',
        flags: MessageFlags.Ephemeral,
      });
    }
  }
});

export { client };
