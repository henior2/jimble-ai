import { telegram } from '@telegram/db';
import type { Database } from 'lmdb';
import { createRepo } from '@/lib/repo';

export type Chat = {
  key: string;
};

const defaults = {
  key: '',
};

const db: Database<Chat, number> | undefined = telegram?.openDB('chats', {});

export const ChatRepo = db ? createRepo(db, defaults) : null;
