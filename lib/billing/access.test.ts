import { afterEach, describe, expect, it, vi } from "vitest";
import { apiRequest, ApiError } from "@/lib/api/client";
import { billingBlocksOfflineUse, updateBillingAccess } from "./access";

afterEach(() => { updateBillingAccess(null); vi.unstubAllGlobals(); });
describe("billing and offline recovery", () => {
  it("honors the server cutoff even while the browser is offline", () => {
    updateBillingAccess({ blocked: false, blockAt: "2026-11-08T03:00:00Z" });
    expect(billingBlocksOfflineUse(Date.parse("2026-11-08T02:59:59Z"))).toBe(false);
    expect(billingBlocksOfflineUse(Date.parse("2026-11-08T03:00:00Z"))).toBe(true);
  });
  it("does not queue sales or return cached business reads when billing is blocked", async () => {
    updateBillingAccess({ blocked: true });
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("offline")));
    for (const init of [undefined, { method: "POST", body: "{}" }]) {
      const result = await apiRequest("/sales", init).catch(error => error as unknown);
      expect(result).toBeInstanceOf(ApiError);
      if (!(result instanceof ApiError)) throw new Error("Expected a billing API error");
      expect(result.status).toBe(403);
    }
  });
  it("a confirmed renewal replaces a previous block", () => {
    updateBillingAccess({ blocked: true });
    updateBillingAccess({ blocked: false, blockAt: "2099-01-01T00:00:00Z" });
    expect(billingBlocksOfflineUse()).toBe(false);
  });
});
