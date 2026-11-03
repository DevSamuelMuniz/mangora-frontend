// @vitest-environment node
import { createHmac } from "node:crypto";
import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { signBackendIdentity } from "@/lib/api/backend-identity";
import { GET, POST } from "@/app/api/backend/[...path]/route";

vi.mock("@/lib/api/config", () => ({ API_BASE_URL: "https://api.example.test/api", assertApiUrlConfigured: vi.fn() }));
const secret = "test-secret-with-at-least-32-characters";
beforeEach(() => { vi.stubEnv("VERCEL", "1"); vi.stubEnv("FRONTEND_PROXY_SECRET", secret); });
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });
const context = { params: Promise.resolve({ path: ["auth", "login"] }) };

describe("backend proxy", () => {
  it("signs the Vercel client IP for the exact backend method and URL", () => {
    const target = new URL("https://api.example.test/api/auth/login?source=test");
    const headers = signBackendIdentity(new Headers({ "x-vercel-forwarded-for": "203.0.113.8", "x-forwarded-for": "forged" }), target, "POST");
    expect(headers.get("x-mangora-client-ip")).toBe("203.0.113.8");
    const timestamp = headers.get("x-mangora-client-time");
    expect(headers.get("x-mangora-client-signature")).toBe(createHmac("sha256", secret).update(`203.0.113.8\n${timestamp}\nPOST\n/api/auth/login?source=test`).digest("hex"));
  });
  it("does not sign untrusted local headers or malformed IP chains", () => {
    const target = new URL("https://api.example.test/api/auth/login");
    expect(signBackendIdentity(new Headers({ "x-forwarded-for": "1.2.3.4, 5.6.7.8" }), target, "POST").has("x-mangora-client-signature")).toBe(false);
    vi.stubEnv("VERCEL", "");
    expect(signBackendIdentity(new Headers({ "x-forwarded-for": "1.2.3.4" }), target, "POST").has("x-mangora-client-signature")).toBe(false);
  });
  it("distinguishes an HTML edge challenge from a login rate limit", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("<html>Just a moment</html>", { status: 429, headers: { "Content-Type": "text/html", "cf-mitigated": "challenge" } })));
    const result = await GET(new NextRequest("https://mangora.test/api/backend/auth/login"), context);
    expect(result.status).toBe(503);
    expect(await result.json()).toMatchObject({ code: "UPSTREAM_PROTECTION" });
  });
  it("preserves genuine rate-limit JSON and the server retry deadline", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ code: "RATE_LIMITED", retryAfterSeconds: 123 }, { status: 429, headers: { "Retry-After": "123" } })));
    const result = await GET(new NextRequest("https://mangora.test/api/backend/auth/login"), context);
    expect(result.status).toBe(429);
    expect(result.headers.get("Retry-After")).toBe("123");
    expect(await result.json()).toMatchObject({ code: "RATE_LIMITED" });
  });
  it("never replays a login on transport errors and never forwards caller identity signatures", async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error("timeout"));
    vi.stubGlobal("fetch", fetchMock);
    const result = await POST(new NextRequest("https://mangora.test/api/backend/auth/login", { method: "POST", headers: { "x-mangora-client-signature": "forged" }, body: "{}" }), context);
    expect(result.status).toBe(502);
    expect(fetchMock).toHaveBeenCalledOnce();
    expect((fetchMock.mock.calls[0][1].headers as Headers).has("x-mangora-client-signature")).toBe(false);
  });
});
