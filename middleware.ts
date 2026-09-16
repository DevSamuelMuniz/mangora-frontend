import { NextResponse, type NextRequest } from "next/server";

import { LOCALE_COOKIE } from "@/i18n/config";
import { splitLocalePrefix } from "@/i18n/urls";

/**
 * URLs públicas com prefixo de idioma (/en, /es, /pt) são reescritas para o
 * caminho real, mantendo as rotas do app intactas. O idioma do caminho entra
 * como cabeçalho (para o render atual) e como cookie (para as próximas visitas).
 */
export function middleware(request: NextRequest) {
  const { locale, pathname } = splitLocalePrefix(request.nextUrl.pathname);
  if (!locale) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = pathname;

  const headers = new Headers(request.headers);
  headers.set("x-mangora-locale", locale);

  const response = NextResponse.rewrite(url, { request: { headers } });
  response.cookies.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    secure: request.nextUrl.protocol === "https:",
  });
  return response;
}

export const config = {
  matcher: ["/en", "/en/:path*", "/es", "/es/:path*", "/pt", "/pt/:path*"],
};
