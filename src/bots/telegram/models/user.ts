import type { Database } from 'lmdb';
import { createRepo } from '@/lib/repo';
import type { UserPreferences } from '@/types';
import { telegram } from '../db';

export type User = {
  key: string;
  preferences: UserPreferences;
};

const defaults = {
  key: '',
  preferences: { models: {}, search: false },
};

const db: Database<User, number> | undefined = telegram?.openDB('users', {});

export const UserRepo = db ? createRepo(db, defaults) : null;
