/**
 * Pedido de senha de operação sem depender de React.
 *
 * O cliente de API (`lib/api/client.ts`) é código puro e precisa pedir a senha
 * quando o servidor responde 428 `OPERATION_PASSWORD_REQUIRED`. Em vez de abrir
 * um `window.prompt`, ele publica um pedido aqui e o `OperationPasswordProvider`
 * (montado no layout) abre o modal controlado e devolve a resposta.
 *
 * Regra: **um pedido por vez**. Um novo pedido cancela o anterior, para nunca
 * deixar uma Promise pendente segurando uma ação do usuário.
 */
export type OperationPasswordRequest = {
  id: number;
  /** Mensagem devolvida pelo servidor — explica o que está sendo liberado. */
  message: string;
  /** Ação solicitada, quando conhecida (ex.: "Fechamento de caixa"). */
  action: string | null;
  /** Erro da tentativa anterior, exibido no modal. */
  error: string | null;
};

type PendingRequest = OperationPasswordRequest & { resolve: (value: string | null) => void };

let pending: PendingRequest | null = null;
let snapshot: OperationPasswordRequest | null = null;
let nextId = 1;

const listeners = new Set<() => void>();

function publish(next: PendingRequest | null) {
  pending = next;
  snapshot = next ? { id: next.id, message: next.message, action: next.action, error: next.error } : null;
  for (const listener of listeners) listener();
}

/** Assinatura usada pelo provider (`useSyncExternalStore`). */
export function subscribeOperationPassword(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Snapshot estável: só muda quando um pedido é publicado ou resolvido. */
export function operationPasswordSnapshot(): OperationPasswordRequest | null {
  return snapshot;
}

/** Abre o modal e resolve com a senha digitada — ou `null` se o usuário cancelar. */
export function requestOperationPassword(input: { message: string; action?: string | null; error?: string | null }): Promise<string | null> {
  if (pending) {
    const previous = pending;
    publish(null);
    previous.resolve(null);
  }
  return new Promise<string | null>((resolve) => {
    publish({
      id: nextId++,
      message: input.message.trim(),
      action: input.action?.trim() || null,
      error: input.error?.trim() || null,
      resolve,
    });
  });
}

/** Chamada pelo modal: entrega a senha (ou `null` para cancelar). */
export function resolveOperationPassword(value: string | null): void {
  const current = pending;
  if (!current) return;
  const answer = value?.trim() ? value : null;
  publish(null);
  current.resolve(answer);
}

/** Há um pedido de senha aberto? */
export function isOperationPasswordPending(): boolean {
  return pending !== null;
}
