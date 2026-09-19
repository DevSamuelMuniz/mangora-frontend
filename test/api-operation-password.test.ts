import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError, apiRequest } from "@/lib/api/client";
import { operationPasswordSnapshot, resolveOperationPassword, subscribeOperationPassword } from "@/lib/security/operation-password";

/** Responde automaticamente a cada pedido de senha — exatamente como o modal controlado faria. */
function answerPasswordWith(answer: string | null) {
  return subscribeOperationPassword(() => resolveOperationPassword(answer));
}

/** Cada chamada precisa de uma `Response` nova: o corpo só pode ser lido uma vez. */
function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

const REQUIRED = { code: "OPERATION_PASSWORD_REQUIRED", message: "Confirme sua senha para continuar." };
const WRONG = { code: "OPERATION_PASSWORD_REQUIRED", message: "Senha incorreta. Confirme novamente para continuar." };

describe("apiRequest com senha de operação", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    resolveOperationPassword(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("abre o modal controlado (nunca window.prompt) e repete a requisição com a senha", async () => {
    const promptSpy = vi.fn(() => "senha-digitada-no-prompt");
    Object.defineProperty(window, "prompt", { value: promptSpy, configurable: true });
    const fetchMock = vi.fn()
      .mockImplementationOnce(() => Promise.resolve(jsonResponse(428, REQUIRED)))
      .mockImplementationOnce(() => Promise.resolve(jsonResponse(200, { ok: true })));
    vi.stubGlobal("fetch", fetchMock);
    const unsubscribe = answerPasswordWith("senha-da-gerente");

    await expect(apiRequest<{ ok: boolean }>("/sales", { method: "POST", body: "{}" })).resolves.toEqual({ ok: true });
    unsubscribe();

    expect(promptSpy).not.toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const headers = (fetchMock.mock.calls[1]?.[1] as RequestInit).headers as Record<string, string>;
    expect(headers["x-operation-password"]).toBe("senha-da-gerente");
  });

  it("repete o pedido enquanto a senha estiver errada e desiste na terceira tentativa", async () => {
    let calls = 0;
    const fetchMock = vi.fn().mockImplementation(() => Promise.resolve(jsonResponse(428, calls++ === 0 ? REQUIRED : WRONG)));
    vi.stubGlobal("fetch", fetchMock);
    const requests: string[] = [];
    const unsubscribe = subscribeOperationPassword(() => {
      const snapshot = operationPasswordSnapshot();
      if (!snapshot) return; // notificação de fechamento do modal
      requests.push(snapshot.message);
      resolveOperationPassword("senha-errada");
    });

    await expect(apiRequest("/suppliers", { method: "POST", body: "{}" })).rejects.toMatchObject({
      status: 428,
      message: "Senha incorreta. Confirme novamente para continuar.",
    });
    unsubscribe();

    expect(requests).toHaveLength(3); // um pedido por tentativa, nunca mais que o limite
    expect(requests[0]).toBe(REQUIRED.message); // primeira abertura com a mensagem do servidor
    expect(requests[1]).toBe(WRONG.message); // reabre mostrando o motivo da senha incorreta
    expect(fetchMock).toHaveBeenCalledTimes(4); // requisição inicial + 3 com senha
  });

  it("encerra a operação quando o usuário cancela o modal", async () => {
    const fetchMock = vi.fn().mockImplementation(() => Promise.resolve(jsonResponse(428, REQUIRED)));
    vi.stubGlobal("fetch", fetchMock);
    const unsubscribe = answerPasswordWith(null);

    await expect(apiRequest("/products", { method: "POST", body: "{}" })).rejects.toBeInstanceOf(ApiError);
    unsubscribe();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("não pede senha em requisições de leitura", async () => {
    const fetchMock = vi.fn().mockImplementation(() => Promise.resolve(jsonResponse(200, { ok: true })));
    vi.stubGlobal("fetch", fetchMock);
    const listener = vi.fn();
    const unsubscribe = subscribeOperationPassword(listener);

    await expect(apiRequest<{ ok: boolean }>("/products")).resolves.toEqual({ ok: true });
    unsubscribe();
    expect(listener).not.toHaveBeenCalled();
  });

  it("não interfere quando o servidor responde erro diferente de 428", async () => {
    const fetchMock = vi.fn().mockImplementation(() => Promise.resolve(jsonResponse(400, { message: "Dados inválidos." })));
    vi.stubGlobal("fetch", fetchMock);
    const listener = vi.fn();
    const unsubscribe = subscribeOperationPassword(listener);

    await expect(apiRequest("/products", { method: "POST", body: "{}" })).rejects.toMatchObject({ status: 400 });
    unsubscribe();
    expect(listener).not.toHaveBeenCalled();
  });
});
