import type { Database, Key } from 'lmdb';

export type Repo<V, K extends Key> = {
  get: (id: K) => V;
  set: (id: K, value: V) => Promise<void>;
  patch: (id: K, patch: Partial<V>) => Promise<void>;
  delete: (id: K) => Promise<void>;
};

export function createRepo<V, K extends Key>(
  database: Database<V, K>,
  defaults: V,
): Repo<V, K> {
  return {
    get(id: K) {
      return database.get(id) ?? defaults;
    },

    async set(id: K, value: V) {
      await database.put(id, value);
    },

    async patch(id: K, patch: Partial<V>) {
      await database.put(id, { ...this.get(id), ...patch });
    },

    async delete(id: K) {
      await database.remove(id);
    },
  };
}
