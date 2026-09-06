/** Authentication and administrative secrets must never enter offline storage. */
export function isSensitivePath(path: string): boolean {
  const pathname = path.split(/[?#]/)[0].toLowerCase();
  return /^\/(auth|system-admin|fiscal|subscription|employees|companies)(\/|$)/.test(pathname);
}
