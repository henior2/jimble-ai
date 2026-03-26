import type { Message } from 'grammy/types';
import type { Database } from 'lmdb';
import { createRepo } from '@/lib/repo';
import { telegramMessages } from '../db';

const db = telegramMessages as Database<Message.CommonMessage, number> | null;

export const MessageRepo = db ? createRepo(db, null) : null;
