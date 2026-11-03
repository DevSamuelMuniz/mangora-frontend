import { isGuidePath } from "@/lib/guides";
import { NextResponse, type NextRequest } from "next/server";

import { LOCALE_COOKIE } from "@/i18n/config";
import { splitLocalePrefix } from "@/i18n/urls";
import { geoFromHeaders, geoHeaders } from "@/lib/regional/geo";
import { isPublicMarketingPath } from "@/lib/seo";

/**
 * Duas responsabilidades:
 *
 * 1. URLs públicas com prefixo de idioma (/en, /es, /pt) são reescritas para o
 *    caminho real, mantendo as rotas do app intactas. O idioma do caminho entra
 *    como cabeçalho (para o render atual) e como cookie (para as próximas visitas).
 * 2. A geolocalização por IP do provedor (Vercel/Cloudflare) é normalizada para os
 *    cabeçalhos internos `x-mangora-geo-*`, que alimentam a escolha automática de
 *    idioma e a sugestão de moeda/fuso — sem API externa e sem permissão do navegador.
 *
 * A geolocalização é apenas uma sugestão: a preferência salva, o caminho com
 * prefixo e o cookie do usuário continuam vencendo (ver `resolveLocale`).
 */
export function proxy(request: NextRequest) {
  const geo = geoFromHeaders((name) => request.headers.get(name));
  const { locale, pathname } = splitLocalePrefix(request.nextUrl.pathname);

  if (locale && isGuidePath(pathname)) {
    const canonical = request.nextUrl.clone();
    canonical.pathname = pathname;
    return NextResponse.redirect(canonical, 308);
  }

  const headers = new Headers(request.headers);
  headers.delete("x-mangora-public-locale");
  headers.delete("x-mangora-locale");
  for (const [name, value] of Object.entries(geoHeaders(geo))) headers.set(name, value);
  if (isPublicMarketingPath(pathname)) headers.set("x-mangora-public-locale", locale ?? "pt-BR");

  const applyIndexing = (response: NextResponse) => {
    if (!isPublicMarketingPath(pathname) && !pathname.startsWith("/loja/") && !pathname.startsWith("/opengraph-image")) response.headers.set("X-Robots-Tag", "noindex, nofollow");
    return response;
  };
  if (!locale) return applyIndexing(NextResponse.next({ request: { headers } }));

  headers.set("x-mangora-locale", locale);

  const url = request.nextUrl.clone();
  url.pathname = pathname;

  const response = NextResponse.rewrite(url, { request: { headers } });
  response.cookies.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    secure: request.nextUrl.protocol === "https:",
  });
  return applyIndexing(response);
}

export const config = {
  // Páginas (inclui raiz, área logada e prefixos de idioma) — sem assets, API, _next e arquivos estáticos.
  matcher: ["/((?!_next/|api/|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|txt|xml|json|js|css|woff2?|ttf|map)$).*)"],
};
