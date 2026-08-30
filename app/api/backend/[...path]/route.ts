import { NextRequest } from "next/server";
import { API_BASE_URL, assertApiUrlConfigured } from "@/lib/api/config";

const BACKEND_URL = API_BASE_URL;

type RouteContext = { params: Promise<{ path: string[] }> };

async function proxy(request: NextRequest, context: RouteContext) {
  assertApiUrlConfigured();
  const { path } = await context.params;
  const target = new URL(`${BACKEND_URL}/${path.map(encodeURIComponent).join("/")}`);
  target.search = request.nextUrl.search;

  const headers = new Headers();
  for (const name of ["accept", "content-type", "cookie", "user-agent"]) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }
  headers.set("x-forwarded-host", request.headers.get("host") ?? "");
  headers.set("x-forwarded-proto", request.nextUrl.protocol.replace(":", ""));

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

  const responseHeaders = new Headers(response.headers);
  responseHeaders.delete("content-encoding");
  responseHeaders.delete("content-length");
  const cookieHeaders = (response.headers as Headers & { getSetCookie?: () => string[] }).getSetCookie?.()
    ?? (response.headers.get("set-cookie") ? [response.headers.get("set-cookie")!] : []);
  if (cookieHeaders.length) {
    responseHeaders.delete("set-cookie");
    for (const cookie of cookieHeaders) {
      // The browser is talking to www.mangora.com.br, not directly to the API.
      // Removing Domain makes login and logout cookies belong to this origin.
      responseHeaders.append("set-cookie", cookie.replace(/;\s*domain=[^;]+/i, ""));
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
