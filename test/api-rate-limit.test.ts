import { afterEach, expect, it, vi } from "vitest";
import { apiRequest } from "@/lib/api/client";

afterEach(() => vi.unstubAllGlobals());
it("shows the actual rate-limit retry time without retrying a password submission", async () => {
  const fetchMock = vi.fn().mockResolvedValue(Response.json({ code: "RATE_LIMITED" }, { status: 429, headers: { "Retry-After": "900" } }));
  vi.stubGlobal("fetch", fetchMock);
  await expect(apiRequest("/auth/login", { method: "POST", body: "{}" })).rejects.toMatchObject({ status: 429, retryAfterSeconds: 900, message: expect.stringContaining("15 minutos") });
  expect(fetchMock).toHaveBeenCalledOnce();
});
it("does not call an upstream protection error too many password attempts", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ code: "UPSTREAM_PROTECTION", message: "Conexão bloqueada pela hospedagem." }, { status: 503 })));
  await expect(apiRequest("/auth/login", { method: "POST", body: "{}" })).rejects.toMatchObject({ status: 503, message: "Conexão bloqueada pela hospedagem." });
});
