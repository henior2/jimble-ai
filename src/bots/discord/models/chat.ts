import type { Snowflake } from 'discord.js';
import type { Database } from 'lmdb';
import { Repo } from '@/lib/repo';
import { discord } from '../db';

export type Chat = {
  key: string;
};

const defaults = {
  key: '',
};

const db: Database<Chat, Snowflake> | undefined = discord?.openDB('chats', {});

export const ChatRepo = db ? new Repo<Chat, Snowflake>(db, defaults) : null;
