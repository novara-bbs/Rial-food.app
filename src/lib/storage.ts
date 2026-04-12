/**
 * Persistent storage abstraction.
 *
 * Strategy:
 *  - Lightweight state (settings, profile, flags) → localStorage (fast, synchronous)
 *  - Large datasets (recipes, nutrition logs, posts) → IndexedDB via idb
 *
 * All IndexedDB access goes through this module so migration/version bumps
 * are handled in one place.
 */
import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import { logger } from './logger';

// ─── DB Schema ────────────────────────────────────────────────────────────────

interface RialDB extends DBSchema {
  savedRecipes: {
    key: string;
    value: {
      id: string;
      data: unknown;
      updatedAt: number;
    };
  };
  nutritionHistory: {
    key: string; // ISO date string YYYY-MM-DD
    value: {
      date: string;
      data: unknown;
      updatedAt: number;
    };
  };
  communityPosts: {
    key: string;
    value: {
      id: string;
      data: unknown;
      updatedAt: number;
    };
    indexes: { 'by-updated': number };
  };
  userFoods: {
    key: string;
    value: {
      id: string;
      data: unknown;
      updatedAt: number;
    };
  };
}

const DB_NAME = 'rial-db';
const DB_VERSION = 1;

// ─── DB singleton ─────────────────────────────────────────────────────────────

let dbPromise: Promise<IDBPDatabase<RialDB>> | null = null;

function getDB(): Promise<IDBPDatabase<RialDB>> {
  if (!dbPromise) {
    dbPromise = openDB<RialDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('savedRecipes')) {
          db.createObjectStore('savedRecipes', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('nutritionHistory')) {
          db.createObjectStore('nutritionHistory', { keyPath: 'date' });
        }
        if (!db.objectStoreNames.contains('communityPosts')) {
          const store = db.createObjectStore('communityPosts', { keyPath: 'id' });
          store.createIndex('by-updated', 'updatedAt');
        }
        if (!db.objectStoreNames.contains('userFoods')) {
          db.createObjectStore('userFoods', { keyPath: 'id' });
        }
      },
      blocked() {
        logger.warn('IndexedDB upgrade blocked — old tab may be open');
      },
      blocking() {
        // Close our connection so newer version can upgrade
        dbPromise = null;
      },
    }).catch((err) => {
      dbPromise = null;
      logger.error('Failed to open IndexedDB', { error: String(err) });
      throw err;
    });
  }
  return dbPromise;
}

// ─── Generic helpers ──────────────────────────────────────────────────────────

type StoreName = keyof RialDB;

async function dbGet<T>(store: StoreName, key: string): Promise<T | undefined> {
  try {
    const db = await getDB();
    const record = await db.get(store as 'savedRecipes', key);
    return record ? (record.data as T) : undefined;
  } catch (err) {
    logger.warn(`IDB get failed [${store}]`, { key, error: String(err) });
    return undefined;
  }
}

async function dbPut(store: StoreName, id: string, data: unknown): Promise<void> {
  try {
    const db = await getDB();
    await db.put(store as 'savedRecipes', { id, data, updatedAt: Date.now() } as never);
  } catch (err) {
    logger.warn(`IDB put failed [${store}]`, { id, error: String(err) });
  }
}

async function dbGetAll<T>(store: StoreName): Promise<T[]> {
  try {
    const db = await getDB();
    const records = await db.getAll(store as 'savedRecipes');
    return records.map((r) => r.data as T);
  } catch (err) {
    logger.warn(`IDB getAll failed [${store}]`, { error: String(err) });
    return [];
  }
}

async function dbDelete(store: StoreName, key: string): Promise<void> {
  try {
    const db = await getDB();
    await db.delete(store as 'savedRecipes', key);
  } catch (err) {
    logger.warn(`IDB delete failed [${store}]`, { key, error: String(err) });
  }
}

async function dbClear(store: StoreName): Promise<void> {
  try {
    const db = await getDB();
    await db.clear(store as 'savedRecipes');
  } catch (err) {
    logger.warn(`IDB clear failed [${store}]`, { error: String(err) });
  }
}

// ─── Typed store APIs ─────────────────────────────────────────────────────────

export const savedRecipesStore = {
  getAll: <T>() => dbGetAll<T>('savedRecipes'),
  get: <T>(id: string) => dbGet<T>('savedRecipes', id),
  put: (id: string, data: unknown) => dbPut('savedRecipes', id, data),
  delete: (id: string) => dbDelete('savedRecipes', id),
  clear: () => dbClear('savedRecipes'),
};

export const nutritionHistoryStore = {
  getAll: <T>() => dbGetAll<T>('nutritionHistory'),
  get: <T>(date: string) => dbGet<T>('nutritionHistory', date),
  put: (date: string, data: unknown) => dbPut('nutritionHistory', date, data),
  delete: (date: string) => dbDelete('nutritionHistory', date),
  clear: () => dbClear('nutritionHistory'),
};

export const communityPostsStore = {
  getAll: <T>() => dbGetAll<T>('communityPosts'),
  get: <T>(id: string) => dbGet<T>('communityPosts', id),
  put: (id: string, data: unknown) => dbPut('communityPosts', id, data),
  delete: (id: string) => dbDelete('communityPosts', id),
  clear: () => dbClear('communityPosts'),
};

export const userFoodsStore = {
  getAll: <T>() => dbGetAll<T>('userFoods'),
  get: <T>(id: string) => dbGet<T>('userFoods', id),
  put: (id: string, data: unknown) => dbPut('userFoods', id, data),
  delete: (id: string) => dbDelete('userFoods', id),
  clear: () => dbClear('userFoods'),
};

// ─── Migration helper ─────────────────────────────────────────────────────────
// Call once on app startup to migrate large localStorage arrays → IndexedDB.
// Safe to call multiple times (idempotent — only migrates if localStorage key exists).

type MigratableItem = { id?: string; date?: string };

export async function migrateLocalStorageToIDB(): Promise<void> {
  const migrations: Array<{
    lsKey: string;
    store: typeof savedRecipesStore | typeof communityPostsStore | typeof userFoodsStore | typeof nutritionHistoryStore;
    idField: 'id' | 'date';
  }> = [
    { lsKey: 'rial_savedRecipes', store: savedRecipesStore, idField: 'id' },
    { lsKey: 'rial_communityPosts', store: communityPostsStore, idField: 'id' },
    { lsKey: 'rial_userFoods', store: userFoodsStore, idField: 'id' },
    { lsKey: 'rial_nutritionHistory', store: nutritionHistoryStore, idField: 'date' },
  ];

  for (const { lsKey, store, idField } of migrations) {
    const raw = localStorage.getItem(lsKey);
    if (!raw) continue;

    try {
      const items = JSON.parse(raw) as MigratableItem[];
      if (!Array.isArray(items) || items.length === 0) continue;

      const existing = await store.getAll();
      if (existing.length > 0) continue; // Already migrated

      for (const item of items) {
        const key = item[idField];
        if (key) await store.put(key, item);
      }

      // Remove from localStorage after successful migration
      localStorage.removeItem(lsKey);
      logger.info(`Migrated ${items.length} items from localStorage[${lsKey}] to IndexedDB`);
    } catch (err) {
      logger.warn(`Migration failed for ${lsKey}`, { error: String(err) });
    }
  }
}
