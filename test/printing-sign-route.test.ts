// @vitest-environment node
import { createHash, generateKeyPairSync, verify } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/printing/sign/route";
import { GET } from "@/app/api/printing/certificate/route";

const session = vi.hoisted(() => vi.fn());
vi.mock("@/lib/auth/server", () => ({ getCurrentSession: session }));
const keys = generateKeyPairSync("rsa", { modulusLength: 2048 });
const payload = () => ({ call: "print", timestamp: Date.now(), params: { data: [{ type: "pixel", format: "pdf", flavor: "base64", data: "JVBERi0x" }] } });
function request(value: unknown, origin = "https://mangora.test") {
  return new Request("https://mangora.test/api/printing/sign", { method: "POST", headers: { origin }, body: JSON.stringify(value) });
}
beforeEach(() => {
  session.mockResolvedValue({ security: { nextStep: null }, company: { accessBlocked: false, status: "ACTIVE" } });
  vi.stubEnv("QZ_PRIVATE_KEY", keys.privateKey.export({ type: "pkcs8", format: "pem" }).toString());
});
afterEach(() => vi.unstubAllEnvs());
describe("QZ server signing", () => {
  it("signs the exact SHA256 hex digest using RSA-SHA512 as required by QZ", async () => {
    const value = payload();
    const result = await POST(request(value));
    expect(result.status).toBe(200);
    const hash = createHash("sha256").update(JSON.stringify(value)).digest("hex");
    expect(verify("RSA-SHA512", Buffer.from(hash), keys.publicKey, Buffer.from(await result.text(), "base64"))).toBe(true);
    expect(result.headers.get("cache-control")).toBe("no-store");
  });
  it("rejects cross-origin, unauthenticated and incomplete sessions", async () => {
    expect((await POST(request(payload(), "https://other.test"))).status).toBe(403);
    session.mockResolvedValueOnce(null);
    expect((await POST(request(payload()))).status).toBe(403);
    session.mockResolvedValueOnce({ security: { nextStep: "mfa" }, company: { status: "ACTIVE" } });
    expect((await POST(request(payload()))).status).toBe(403);
  });
  it("rejects stale and unrelated operations instead of becoming a generic signing oracle", async () => {
    expect((await POST(request({ ...payload(), timestamp: 0 }))).status).toBe(400);
    expect((await POST(request({ ...payload(), call: "file.write" }))).status).toBe(400);
  });
  it("uses explicit unsigned mode without keys and never returns the private key", async () => {
    vi.stubEnv("QZ_PRIVATE_KEY", "");
    expect((await GET()).status).toBe(204);
    expect((await POST(request(payload()))).status).toBe(503);
    vi.stubEnv("QZ_PRIVATE_KEY", "secret-key");
    vi.stubEnv("QZ_CERTIFICATE", "public-certificate");
    expect(await (await GET()).text()).toBe("public-certificate");
  });
});
