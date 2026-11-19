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
  it.each(["mangora.com.br", "www.mangora.com.br"])("persists device trust across official frontend hosts: %s", async host => {
    const expires = new Date(Date.now() + 30 * 86400000).toUTCString();
    const headers = new Headers({ "content-type": "application/json" });
    headers.append("set-cookie", `mangora_trusted_device=test-trust; Domain=api.mangora.com.br; Path=/; Expires=${expires}; Max-Age=2592000; HttpOnly; Secure; SameSite=Lax`);
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("{}", { headers })));
    const response = await POST(new NextRequest(`https://${host}/api/backend/auth/security/mfa/challenge`, { method: "POST", body: "{}" }), { params: Promise.resolve({ path: ["auth", "security", "mfa", "challenge"] }) });
    const cookies = response.headers.getSetCookie();
    expect(cookies).toHaveLength(2);
    expect(cookies[0]).toContain("Max-Age=0");
    expect(cookies[0]).not.toContain("Domain=");
    expect(cookies[1]).toContain("Domain=mangora.com.br");
    expect(cookies[1]).toContain("Max-Age=2592000");
    expect(cookies[1]).toContain("HttpOnly");
    expect(cookies[1]).not.toContain("Domain=api.");
    expect(response.headers.get("cache-control")).toBe("no-store");
  });
  it("keeps preview cookies local and forwards the trust token and browser on the next login", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("{}", { headers: { "set-cookie": "mangora_trusted_device=test-trust; Domain=api.example.test; Path=/; Max-Age=2592000; HttpOnly" } }));
    vi.stubGlobal("fetch", fetchMock);
    const result = await POST(new NextRequest("https://preview.example.test/api/backend/auth/login", { method: "POST", headers: { cookie: "mangora_trusted_device=test-trust", "user-agent": "test-browser" }, body: "{}" }), context);
    expect(result.headers.get("set-cookie")).not.toContain("Domain=");
    const forwarded = fetchMock.mock.calls[0][1].headers as Headers;
    expect(forwarded.get("cookie")).toBe("mangora_trusted_device=test-trust");
    expect(forwarded.get("user-agent")).toBe("test-browser");
  });
  it("keeps sessions host-only and propagates trust revocation to both cookie scopes", async () => {
    const headers = new Headers();
    headers.append("set-cookie", "gestao_access_token=session; Domain=api.mangora.com.br; Path=/; HttpOnly; Secure");
    headers.append("set-cookie", "mangora_trusted_device=; Domain=api.mangora.com.br; Path=/; Max-Age=0; HttpOnly; Secure");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("{}", { headers })));
    const result = await POST(new NextRequest("https://www.mangora.com.br/api/backend/auth/login", { method: "POST", body: "{}" }), context);
    const cookies = result.headers.getSetCookie();
    expect(cookies.find(cookie => cookie.startsWith("gestao_access_token="))).not.toContain("Domain=");
    expect(cookies.filter(cookie => cookie.startsWith("mangora_trusted_device="))).toHaveLength(2);
    for (const cookie of cookies.filter(cookie => cookie.startsWith("mangora_trusted_device="))) expect(cookie).toContain("Max-Age=0");
  });
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
