/** In-memory server entitlement. Never persist financial/session data offline. */
type BillingAccess = { blocked: boolean; blockAt?: string | null };
let current: BillingAccess | null = null;
export function updateBillingAccess(access: BillingAccess | null) { current = access; }
export function billingBlocksOfflineUse(now = Date.now()) {
  return Boolean(current?.blocked || (current?.blockAt && Date.parse(current.blockAt) <= now));
}
