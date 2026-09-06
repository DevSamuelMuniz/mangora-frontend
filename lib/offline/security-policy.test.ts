import { describe, expect, it } from "vitest";
import { isSensitivePath } from "./security-policy";
import { enqueueMutation, cacheWrite, cacheRead } from "./engine";

describe("offline security", () => {
  it.each(["/auth/login", "/auth/register", "/auth/change-password", "/fiscal/provider", "/employees", "/system-admin/users", "/companies/current"])("never queues secrets for %s", async path => {
    expect(isSensitivePath(path)).toBe(true);
    await expect(enqueueMutation("POST", path, "secret")).rejects.toThrow();
    await cacheWrite(path, { password: "secret" });
    expect(await cacheRead(path)).toBeUndefined();
  });
  it("does not classify ordinary product operations as credentials", () => { expect(isSensitivePath("/products")).toBe(false); });
});
