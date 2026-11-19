import { NextRequest } from "next/server";
import { API_BASE_URL, assertApiUrlConfigured } from "@/lib/api/config";
import { signBackendIdentity } from "@/lib/api/backend-identity";

const BACKEND_URL = API_BASE_URL;

type RouteContext = { params: Promise<{ path: string[] }> };

async function proxy(request: NextRequest, context: RouteContext) {
  assertApiUrlConfigured();
  if (!["GET", "HEAD", "OPTIONS"].includes(request.method) && request.headers.get("sec-fetch-site") === "cross-site") {
    return Response.json({ message: "Origem da requisição não autorizada." }, { status: 403 });
  }
  const { path } = await context.params;
  const target = new URL(`${BACKEND_URL}/${path.map(encodeURIComponent).join("/")}`);
  target.search = request.nextUrl.search;

  const headers = new Headers();
  for (const name of ["accept", "content-type", "cookie", "user-agent", "x-forwarded-for", "x-operation-password"]) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }
  const preferredCountry = request.cookies.get("mangora_country")?.value;
  const inferredCountry = request.headers.get("x-vercel-ip-country") ?? request.headers.get("cf-ipcountry");
  if (preferredCountry && /^[A-Z]{2}$/.test(preferredCountry)) headers.set("x-market-country", preferredCountry);
  if (inferredCountry && /^[A-Z]{2}$/i.test(inferredCountry)) headers.set("x-vercel-ip-country", inferredCountry.toUpperCase());
  headers.set("x-forwarded-host", request.headers.get("host") ?? "");
  headers.set("x-forwarded-proto", request.nextUrl.protocol.replace(":", ""));
  signBackendIdentity(request.headers, target, request.method, headers);

  const hasBody = !["GET", "HEAD"].includes(request.method);
  let response: Response;
  try {
    response = await fetch(target, {
      method: request.method,
      headers,
      body: hasBody ? await request.arrayBuffer() : undefined,
      cache: "no-store",
      redirect: "manual",
      signal: AbortSignal.timeout(15_000),
    });
  } catch {
    return Response.json({ message: "O servidor da Mangora está temporariamente indisponível. Tente novamente em instantes." }, { status: 502 });
  }

  // Edge protection can return an HTML challenge with 429. It is not a failed
  // password attempt and cannot be completed inside this server-side fetch.
  if (response.headers.get("cf-mitigated") === "challenge" || response.headers.get("content-type")?.includes("text/html")) {
    console.error(JSON.stringify({ event: "backend_upstream_protection", status: response.status, path: target.pathname, trace: response.headers.get("cf-ray") }));
    await response.body?.cancel();
    return Response.json({ code: "UPSTREAM_PROTECTION", message: "A conexão com o servidor foi bloqueada pela proteção da hospedagem. Tente novamente em instantes. Se persistir, entre em contato com o suporte." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }

  const responseHeaders = new Headers(response.headers);
  if (path[0] === "auth") responseHeaders.set("cache-control", "no-store");
  responseHeaders.delete("content-encoding");
  responseHeaders.delete("content-length");
  const cookieHeaders = (response.headers as Headers & { getSetCookie?: () => string[] }).getSetCookie?.()
    ?? (response.headers.get("set-cookie") ? [response.headers.get("set-cookie")!] : []);
  if (cookieHeaders.length) {
    responseHeaders.delete("set-cookie");
    for (const cookie of cookieHeaders) {
      // Sessions stay host-only. Device trust must survive moving between the
      // two official frontend hosts; never apply this domain to preview/local URLs.
      const hostOnly = cookie.replace(/;\s*domain=[^;]+/i, "");
      const officialHost = ["mangora.com.br", "www.mangora.com.br"].includes(request.nextUrl.hostname);
      const trustedCookie = /^mangora_trusted_device=/.test(hostOnly);
      if (trustedCookie && officialHost) {
        // Migrate the earlier host-only cookie, including logout/disable expiry.
        responseHeaders.append("set-cookie", "mangora_trusted_device=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0");
        responseHeaders.append("set-cookie", `${hostOnly}; Domain=mangora.com.br`);
      } else {
        responseHeaders.append("set-cookie", hostOnly);
      }
    }
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  });
}

export const dynamic = "force-dynamic";
export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
