import { afterEach, describe, expect, it, vi } from "vitest";

import { assertApiUrlConfigured, isApiUrlConfigured } from "./config";

describe("isApiUrlConfigured", () => {
    afterEach(() => {
        vi.unstubAllEnvs();
    });

    it("considera configurado fora de produção (dev local)", () => {
        vi.stubEnv("NODE_ENV", "development");
        expect(isApiUrlConfigured()).toBe(true);
    });

    it("detecta produção sem API_URL (fallback localhost)", () => {
        vi.stubEnv("NODE_ENV", "production");
        expect(isApiUrlConfigured()).toBe(false);
    });

    it("não falha durante o build/prerender (NEXT_PHASE definido)", () => {
        vi.stubEnv("NODE_ENV", "production");
        vi.stubEnv("NEXT_PHASE", "phase-production-build");
        expect(isApiUrlConfigured()).toBe(true);
    });
});

describe("assertApiUrlConfigured", () => {
    afterEach(() => {
        vi.unstubAllEnvs();
    });

    it("lança erro descritivo em produção sem API_URL", () => {
        vi.stubEnv("NODE_ENV", "production");
        expect(() => assertApiUrlConfigured()).toThrow(/API_URL não configurada/);
    });

    it("não lança fora de produção", () => {
        vi.stubEnv("NODE_ENV", "test");
        expect(() => assertApiUrlConfigured()).not.toThrow();
    });
});
