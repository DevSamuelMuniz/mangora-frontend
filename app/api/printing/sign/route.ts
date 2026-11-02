import { createHash, createSign } from "node:crypto";
import { getCurrentSession } from "@/lib/auth/server";
import { validSigningRequest } from "@/lib/printing/signing";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin || origin !== new URL(request.url).origin || request.headers.get("sec-fetch-site") === "cross-site") return new Response(null, { status: 403 });
  const session = await getCurrentSession();
  if (!session || session.security.nextStep || session.company.accessBlocked || session.company.status !== "ACTIVE") return new Response(null, { status: 403 });
  const key = process.env.QZ_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!key) return new Response(null, { status: 503 });
  // Bound the stream as well as Content-Length; PDF jobs may contain customer data.
  const reader = request.body?.getReader();
  if (!reader) return new Response(null, { status: 400 });
  const chunks: Uint8Array[] = [];
  let length = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    length += value.length;
    if (length > 12_000_000) { await reader.cancel(); return new Response(null, { status: 413 }); }
    chunks.push(value);
  }
  const text = Buffer.concat(chunks).toString("utf8");
  try {
    if (!validSigningRequest(JSON.parse(text))) return new Response(null, { status: 400 });
    const hash = createHash("sha256").update(text).digest("hex");
    const signature = createSign("RSA-SHA512").update(hash).end().sign(key, "base64");
    return new Response(signature, { headers: { "Content-Type": "text/plain", "Cache-Control": "no-store" } });
  } catch { return new Response(null, { status: 400 }); }
}
