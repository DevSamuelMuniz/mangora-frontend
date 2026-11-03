import "server-only";
import { createHmac } from "node:crypto";
import { isIP } from "node:net";
import { headers } from "next/headers";

export function signBackendIdentity(incoming: Pick<Headers, "get">, target: URL, method: string, outgoing = new Headers()) {
  const secret = process.env.FRONTEND_PROXY_SECRET?.trim();
  // Vercel overwrites these IP headers at its edge. Arbitrary local hosts are not trusted.
  if (!secret || process.env.VERCEL !== "1") return outgoing;
  if (secret.length < 32) throw new Error("FRONTEND_PROXY_SECRET deve possuir pelo menos 32 caracteres.");
  const ip = incoming.get("x-vercel-forwarded-for") ?? incoming.get("x-forwarded-for");
  if (!ip || !isIP(ip)) return outgoing;
  const timestamp = String(Date.now());
  const signature = createHmac("sha256", secret).update(`${ip}\n${timestamp}\n${method.toUpperCase()}\n${target.pathname}${target.search}`).digest("hex");
  outgoing.set("x-mangora-client-ip", ip);
  outgoing.set("x-mangora-client-time", timestamp);
  outgoing.set("x-mangora-client-signature", signature);
  return outgoing;
}

export async function serverBackendHeaders(target: URL, outgoing = new Headers()) {
  if (!process.env.FRONTEND_PROXY_SECRET?.trim() || process.env.VERCEL !== "1") return outgoing;
  return signBackendIdentity(await headers(), target, "GET", outgoing);
}
