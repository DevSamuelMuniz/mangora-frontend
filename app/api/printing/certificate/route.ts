export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const certificate = process.env.QZ_CERTIFICATE?.replace(/\\n/g, "\n");
  if (!certificate || !process.env.QZ_PRIVATE_KEY) return new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });
  return new Response(certificate, { headers: { "Content-Type": "text/plain", "Cache-Control": "no-store" } });
}
