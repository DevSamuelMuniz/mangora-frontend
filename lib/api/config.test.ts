import { afterEach, describe, expect, it, vi } from "vitest";

async function config(apiUrl = "", publicUrl = "") {
    vi.resetModules();
    vi.stubEnv("API_URL", apiUrl);
    vi.stubEnv("NEXT_PUBLIC_API_URL", publicUrl);
    return import("./config");
}

afterEach(() => { vi.unstubAllEnvs(); });

describe("API hospedada no Render", () => {
    it("exige configuração mesmo em desenvolvimento", async () => {
        vi.stubEnv("NODE_ENV", "development");
        const api = await config();
        expect(api.isApiUrlConfigured()).toBe(false);
        expect(() => api.assertApiUrlConfigured()).toThrow(/API_URL não configurada/);
    });

    it("aceita o domínio da API e prioriza a variável do servidor", async () => {
        const api = await config("https://api.mangora.com.br/api/", "https://other.onrender.com/api");
        expect(api.API_BASE_URL).toBe("https://api.mangora.com.br/api");
        expect(api.isApiUrlConfigured()).toBe(true);
    });

    it("mantém compatibilidade com a variável pública do deploy existente", async () => {
        expect((await config("", "https://mangorabackend.onrender.com/api")).isApiUrlConfigured()).toBe(true);
    });

    it("rejeita endereços locais, HTTP e URLs inválidas", async () => {
        for (const url of ["http://localhost:3001/api", "https://localhost/api", "https://127.0.0.1/api", "https://[::1]/api", "http://api.mangora.com.br/api", "invalid"]) {
            expect((await config(url)).isApiUrlConfigured()).toBe(false);
        }
    });
});
