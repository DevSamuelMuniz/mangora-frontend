import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { redirect } from "next/navigation";
import { serverApiRequest } from "./server-client";

vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({ cookies: async () => ({ get: () => ({ name: "gestao_access_token", value: "test-token" }) }) }));
vi.mock("next/navigation", () => ({ redirect: vi.fn((path: string) => { throw new Error(`REDIRECT:${path}`); }) }));
vi.mock("./config", () => ({ API_BASE_URL: "https://api.example.test", assertApiUrlConfigured: vi.fn() }));

beforeEach(() => { vi.clearAllMocks(); });
afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });
function respond(status: number, body: unknown) {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify(body), { status })));
}
describe("serverApiRequest", () => {
  it("redirects overdue accounts to billing instead of crashing the dashboard", async () => {
    respond(403, { code: "SUBSCRIPTION_PAYMENT_REQUIRED" });
    await expect(serverApiRequest("/analytics/dashboard")).rejects.toThrow("REDIRECT:/assinatura");
    expect(redirect).toHaveBeenCalledWith("/assinatura");
  });
  it("redirects expired sessions to login", async () => {
    respond(401, {});
    await expect(serverApiRequest("/analytics/dashboard")).rejects.toThrow("REDIRECT:/login");
  });
  it("redirects accounts requiring verification to account security", async () => {
    respond(403, { code: "ACCOUNT_SECURITY_REQUIRED" });
    await expect(serverApiRequest("/analytics/dashboard")).rejects.toThrow("REDIRECT:/seguranca-da-conta");
  });
  it("preserves dashboard data for allowed accounts", async () => {
    respond(200, { metrics: { sales: 5 } });
    await expect(serverApiRequest("/analytics/dashboard")).resolves.toEqual({ metrics: { sales: 5 } });
    expect(redirect).not.toHaveBeenCalled();
  });
  it("does not mistake other errors for an overdue subscription", async () => {
    respond(500, { message: "Database failure" });
    vi.spyOn(console, "error").mockImplementation(() => {});
    await expect(serverApiRequest("/analytics/dashboard")).rejects.toThrow("Não foi possível carregar os indicadores.");
    expect(redirect).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('"status":500'));
  });
});
