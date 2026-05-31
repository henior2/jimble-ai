import type { Snowflake } from 'discord.js';
import type { Database } from 'lmdb';
import { Repo } from '@/lib/repo';
import type { UserPreferences } from '@/types';
import { discord } from '../db';

export type User = {
  key: string;
  preferences: UserPreferences;
};

const defaults = {
  key: '',
  preferences: { models: {}, search: false },
};

const db: Database<User, Snowflake> | undefined = discord?.openDB('users', {});

export const UserRepo = db ? new Repo<User, Snowflake>(db, defaults) : null;
