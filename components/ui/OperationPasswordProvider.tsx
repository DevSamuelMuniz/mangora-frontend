"use client";

import { useCallback, useSyncExternalStore, type ReactNode } from "react";

import { operationPasswordSnapshot, resolveOperationPassword, subscribeOperationPassword } from "@/lib/security/operation-password";

import OperationPasswordModal from "./OperationPasswordModal";

/**
 * Monta o modal controlado de senha uma única vez para o app inteiro.
 *
 * Qualquer código — inclusive o cliente de API, que não é React — pode pedir a
 * senha com `requestOperationPassword()`; o pedido chega aqui pelo barramento e
 * o modal devolve a resposta para quem pediu (ou `null` se o usuário cancelar).
 * O `key` reinicia o formulário a cada novo pedido.
 */
export function OperationPasswordProvider({ children }: { children: ReactNode }) {
  const request = useSyncExternalStore(subscribeOperationPassword, operationPasswordSnapshot, () => null);

  const submit = useCallback((password: string) => resolveOperationPassword(password), []);
  const cancel = useCallback(() => resolveOperationPassword(null), []);

  return (
    <>
      {children}
      <OperationPasswordModal
        key={request?.id ?? 0}
        open={Boolean(request)}
        action={request?.action ?? null}
        message={request?.message ?? null}
        error={request?.error ?? null}
        onSubmit={submit}
        onCancel={cancel}
      />
    </>
  );
}
