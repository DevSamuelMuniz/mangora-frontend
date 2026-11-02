/** Only the local printer operations this application uses may be signed. */
export function validSigningRequest(value: unknown, now = Date.now()): boolean {
  if (!value || typeof value !== "object") return false;
  const request = value as Record<string, unknown>;
  if (typeof request.timestamp !== "number" || Math.abs(now - request.timestamp) > 60_000) return false;
  if (request.call === "printers.find") return true;
  if (request.call !== "print" || !request.params || typeof request.params !== "object") return false;
  const params = request.params as Record<string, unknown>;
  if (!Array.isArray(params.data) || params.data.length !== 1) return false;
  const data = params.data[0];
  return !!data && data.type === "pixel" && data.format === "pdf" && data.flavor === "base64"
    && typeof data.data === "string" && data.data.startsWith("JVBERi0")
    && /^[A-Za-z0-9+/=]+$/.test(data.data);
}
