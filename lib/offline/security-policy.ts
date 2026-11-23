/** Authentication and administrative secrets must never enter offline storage. */
export function isSensitivePath(path: string): boolean {
  const pathname = path.split(/[?#]/)[0].toLowerCase();
  return /^\/(auth|system-admin|subscription|employees|companies)(\/|$)/.test(pathname);
}

/** Manual catalog/inventory changes require a live server authorization. */
export function requiresOnlineOperationAuthorization(path: string): boolean {
  const pathname = path.split(/[?#]/)[0].toLowerCase().replace(/\/+$/, "");
  return /^\/(products|stock|inventory|batches)(\/|$)/.test(pathname)
    || pathname === "/data-transfer/products/import"
    || /^\/purchases\/[^/]+\/receive\/?$/.test(pathname);
}
