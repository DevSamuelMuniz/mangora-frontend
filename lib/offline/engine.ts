/**
 * Engine offline do Mangora — cache de leituras + fila de mutações.
 * Usa IndexedDB quando disponível e cai para memória quando não (SSR/tests).
 */

export type QueuedMutation = {
  id: string;
  method: string;
  url: string;
  body?: string;
  createdAt: number;
};

const DB_NAME = "mangora-offline";
const DB_VERSION = 1;
const CACHE_STORE = "cache";
const QUEUE_STORE = "queue";

type Storage = {
  cacheGet(key: string): Promise<unknown | undefined>;
  cacheSet(key: string, data: unknown): Promise<void>;
  queueList(): Promise<QueuedMutation[]>;
  queueAdd(item: QueuedMutation): Promise<void>;
  queueRemove(id: string): Promise<void>;
  queueClear(): Promise<void>;
};

const mem = new Map<string, unknown>();

const memoryStorage: Storage = {
  async cacheGet(key) { return mem.get(key); },
  async cacheSet(key, data) { mem.set(key, data); },
  async queueList() {
    const raw = mem.get("queue") as QueuedMutation[] | undefined;
    return raw ? [...raw].sort((a, b) => a.createdAt - b.createdAt) : [];
  },
  async queueAdd(item) {
    const raw = (mem.get("queue") as QueuedMutation[] | undefined) ?? [];
    mem.set("queue", [...raw, item]);
  },
  async queueRemove(id) {
    const raw = (mem.get("queue") as QueuedMutation[] | undefined) ?? [];
    mem.set("queue", raw.filter((item) => item.id !== id));
  },
  async queueClear() { mem.delete("queue"); },
};

let dbPromise: Promise<IDBDatabase | null> | null = null;

function openDb(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === "undefined") return Promise.resolve(null);
  if (!dbPromise) {
    dbPromise = new Promise((resolve) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(CACHE_STORE)) db.createObjectStore(CACHE_STORE);
        if (!db.objectStoreNames.contains(QUEUE_STORE)) db.createObjectStore(QUEUE_STORE, { keyPath: "id" });
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    });
  }
  return dbPromise;
}

function withStore<T>(name: string, mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest): Promise<T> {
  return openDb().then((db) => {
    if (!db) return Promise.reject(new Error("offline:no-db"));
    return new Promise<T>((resolve, reject) => {
      const tx = db.transaction(name, mode);
      const store = tx.objectStore(name);
      const request = run(store);
      request.onsuccess = () => resolve(request.result as T);
      request.onerror = () => reject(request.error);
    });
  });
}

const idbStorage: Storage = {
  async cacheGet(key) {
    try { return await withStore<unknown>(CACHE_STORE, "readonly", (store) => store.get(key)); } catch { return undefined; }
  },
  async cacheSet(key, data) {
    try { await withStore<void>(CACHE_STORE, "readwrite", (store) => store.put(data, key)); } catch { /* offline sem db */ }
  },
  async queueList() {
    try {
      const all = await withStore<QueuedMutation[]>(QUEUE_STORE, "readonly", (store) => store.getAll());
      return all.sort((a, b) => a.createdAt - b.createdAt);
    } catch { return []; }
  },
  async queueAdd(item) {
    try { await withStore<void>(QUEUE_STORE, "readwrite", (store) => store.put(item)); } catch { /* offline sem db */ }
  },
  async queueRemove(id) {
    try { await withStore<void>(QUEUE_STORE, "readwrite", (store) => store.delete(id)); } catch { /* offline sem db */ }
  },
  async queueClear() {
    try { await withStore<void>(QUEUE_STORE, "readwrite", (store) => store.clear()); } catch { /* offline sem db */ }
  },
};

const storage: Storage = typeof indexedDB === "undefined" ? memoryStorage : idbStorage;

// ---------------------------------------------------------------- pub/sub

type Listener = () => void;
const listeners = new Set<Listener>();

function notify() { for (const listener of listeners) listener(); }

export function subscribeOffline(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// ---------------------------------------------------------------- API

export const cacheKeyFor = (path: string): string => `GET:${path}`;

export async function cacheRead(path: string): Promise<unknown | undefined> {
  return storage.cacheGet(cacheKeyFor(path));
}

export async function cacheWrite(path: string, data: unknown): Promise<void> {
  await storage.cacheSet(cacheKeyFor(path), data);
}

export async function enqueueMutation(method: string, url: string, body?: string): Promise<void> {
  const item: QueuedMutation = { id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, method, url, body, createdAt: Date.now() };
  await storage.queueAdd(item);
  notify();
}

export async function queueList(): Promise<QueuedMutation[]> {
  return storage.queueList();
}

export async function pendingCount(): Promise<number> {
  return (await storage.queueList()).length;
}

export async function removeQueued(id: string): Promise<void> {
  await storage.queueRemove(id);
  notify();
}

export async function clearQueue(): Promise<void> {
  await storage.queueClear();
  notify();
}
