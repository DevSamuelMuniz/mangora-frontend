import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  isOperationPasswordPending,
  operationPasswordSnapshot,
  requestOperationPassword,
  resolveOperationPassword,
  subscribeOperationPassword,
} from "@/lib/security/operation-password";

describe("barramento de senha de operação", () => {
  beforeEach(() => {
    // Garante estado limpo entre casos (o módulo guarda um pedido por vez).
    resolveOperationPassword(null);
  });

  it("abre um pedido e resolve com a senha digitada", async () => {
    expect(operationPasswordSnapshot()).toBeNull();
    const pending = requestOperationPassword({ message: "Confirme sua senha para continuar." });
    expect(isOperationPasswordPending()).toBe(true);
    expect(operationPasswordSnapshot()?.message).toBe("Confirme sua senha para continuar.");
    resolveOperationPassword("senha-correta");
    await expect(pending).resolves.toBe("senha-correta");
    expect(operationPasswordSnapshot()).toBeNull();
  });

  it("resolve com null quando o usuário cancela", async () => {
    const pending = requestOperationPassword({ message: "Libere o desconto." });
    resolveOperationPassword(null);
    await expect(pending).resolves.toBeNull();
  });

  it("trata senha vazia como cancelamento", async () => {
    const pending = requestOperationPassword({ message: "Confirme." });
    resolveOperationPassword("   ");
    await expect(pending).resolves.toBeNull();
  });

  it("guarda a ação e o erro da tentativa anterior", () => {
    void requestOperationPassword({ message: "Senha incorreta.", action: "Fechamento de caixa", error: "Senha incorreta." });
    const snapshot = operationPasswordSnapshot();
    expect(snapshot?.action).toBe("Fechamento de caixa");
    expect(snapshot?.error).toBe("Senha incorreta.");
  });

  it("um novo pedido cancela o anterior (nunca deixa Promise pendente)", async () => {
    const first = requestOperationPassword({ message: "Primeiro pedido." });
    const second = requestOperationPassword({ message: "Segundo pedido." });
    await expect(first).resolves.toBeNull();
    expect(operationPasswordSnapshot()?.message).toBe("Segundo pedido.");
    resolveOperationPassword("senha");
    await expect(second).resolves.toBe("senha");
  });

  it("notifica os assinantes a cada mudança", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeOperationPassword(listener);
    void requestOperationPassword({ message: "Pedido." });
    expect(listener).toHaveBeenCalledTimes(1);
    resolveOperationPassword("senha");
    expect(listener).toHaveBeenCalledTimes(2);
    unsubscribe();
    void requestOperationPassword({ message: "Outro pedido." });
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it("resolve sem pedido aberto é inofensivo", () => {
    expect(() => resolveOperationPassword("senha")).not.toThrow();
    expect(isOperationPasswordPending()).toBe(false);
  });
});
