import type { Database } from 'lmdb';
import { Repo } from '@/lib/repo';
import { telegram } from '../db';

export type Chat = {
  key: string;
};

const defaults = {
  key: '',
};

const db: Database<Chat, number> | undefined = telegram?.openDB('chats', {});

export const ChatRepo = db ? new Repo<Chat, number>(db, defaults) : null;
