import { describe, expect, it } from "vitest";
import { isSensitivePath, requiresOnlineOperationAuthorization } from "./security-policy";
import { enqueueMutation, cacheWrite, cacheRead } from "./engine";

describe("offline security", () => {
  it.each(["/auth/login", "/auth/register", "/auth/change-password", "/employees", "/system-admin/users", "/companies/current"])("never queues secrets for %s", async path => {
    expect(isSensitivePath(path)).toBe(true);
    await expect(enqueueMutation("POST", path, "secret")).rejects.toThrow();
    await cacheWrite(path, { password: "secret" });
    expect(await cacheRead(path)).toBeUndefined();
  });
  it("does not classify ordinary product operations as credentials", () => { expect(isSensitivePath("/products")).toBe(false); });
  it.each(["/products", "/products/id", "/stock/movements", "/inventory/counts", "/batches", "/data-transfer/products/import", "/purchases/id/receive"])("requires online authorization without preventing cached reads for %s", async path => {
    expect(requiresOnlineOperationAuthorization(path)).toBe(true);
    await expect(enqueueMutation("POST", path, "{}")).rejects.toThrow("conexão");
    await cacheWrite(path, { name: "Produto" });
    expect(await cacheRead(path)).toEqual({ name: "Produto" });
  });
  it("keeps normal sales and orders in their existing workflow", () => {
    expect(requiresOnlineOperationAuthorization("/sales")).toBe(false);
    expect(requiresOnlineOperationAuthorization("/orders")).toBe(false);
  });
});
