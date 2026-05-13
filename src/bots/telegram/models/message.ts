import type { Message } from 'grammy/types';
import type { Database } from 'lmdb';
import { Repo } from '@/lib/repo';
import { telegramMessages } from '../db';

export type StoredMessage = {
  firstName: string;
  assistant: boolean;
  replyTo?: number;
  text?: string;
};

type ChatID = number;
type MessageID = number;
type StoredMessageKey = [ChatID, MessageID];

const defaults = {
  firstName: '',
  assistant: false,
};

const db = telegramMessages as Database<StoredMessage, StoredMessageKey> | null;

export const MessageRepo = db
  ? new Repo<StoredMessage, StoredMessageKey>(db, defaults)
  : null;
