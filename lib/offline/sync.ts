/**
 * Sync offline — reproduz as mutações enfileiradas quando a conexão volta.
 * As requisições são refeitas na ordem original; em falha, a fila é mantida.
 */

const API_URL = "/api/backend";

import { queueList } from "./engine";

export async function queuePendingCount(): Promise<number> {
  const { pendingCount } = await import("./engine");
  return pendingCount();
}

async function flushOnce(): Promise<{ synced: number; failed: number }> {
  const items = await queueList();
  const { removeQueued } = await import("./engine");
  let synced = 0;
  let failed = 0;
  for (const item of items) {
    try {
      const response = await fetch(`${API_URL}${item.url}`, {
        method: item.method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: item.body,
      });
      if (response.ok) {
        await removeQueued(item.id);
        synced += 1;
      } else if (response.status >= 500) {
        // erro do servidor: tenta de novo mais tarde (mantém a ordem)
        failed += 1;
        break;
      } else {
        // 4xx: a mutação não faz mais sentido — descarta para não travar a fila
        await removeQueued(item.id);
        failed += 1;
      }
    } catch {
      failed += 1;
      break;
    }
  }
  return { synced, failed };
}

let flushing = false;

/** Tenta sincronizar a fila offline. Retorna quantos itens foram aplicados. */
export async function flushPending(): Promise<{ synced: number; failed: number }> {
  if (flushing) return { synced: 0, failed: 0 };
  flushing = true;
  try {
    return await flushOnce();
  } finally {
    flushing = false;
  }
}
