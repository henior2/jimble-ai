import type { Database, Key } from 'lmdb';

export class Repo<V, K extends Key> {
  database: Database<V, K>;
  defaults: V;

  constructor(database: Database<V, K>, defaults: V) {
    this.database = database;
    this.defaults = defaults;
  }

  get(id: K) {
    return this.database.get(id) ?? this.defaults;
  }

  async set(id: K, value: V) {
    await this.database.put(id, value);
  }

  async patch(id: K, patch: Partial<V>) {
    await this.database.put(id, { ...this.get(id), ...patch });
  }

  async delete(id: K) {
    await this.database.remove(id);
  }
}
