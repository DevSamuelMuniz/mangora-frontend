import { defaultLocale, isLocale, type Locale } from "./config";

/**
 * Prefixos públicos de idioma. O pt-BR (padrão) fica na raiz para não quebrar
 * nenhum link já indexado; os demais idiomas ganham um prefixo curto.
 */
export const LOCALE_PREFIX: Record<Locale, string> = {
  "pt-BR": "",
  "en-US": "en",
  "es-ES": "es",
  "pt-PT": "pt",
};

const PREFIX_LOCALE: Record<string, Locale> = {
  en: "en-US",
  es: "es-ES",
  pt: "pt-PT",
};

/** Normaliza um caminho garantindo barra inicial e sem barra final. */
export function normalizePath(pathname: string): string {
  const withSlash = pathname.startsWith("/") ? pathname : `/${pathname}`;
  if (withSlash.length > 1 && withSlash.endsWith("/")) return withSlash.slice(0, -1);
  return withSlash;
}

/** Caminho público de um idioma: `/en/sobre`, `/es`, `/` (pt-BR). */
export function localePath(pathname: string, locale: Locale): string {
  const path = normalizePath(pathname);
  const prefix = LOCALE_PREFIX[locale];
  if (!prefix) return path;
  return path === "/" ? `/${prefix}` : `/${prefix}${path}`;
}

/** Idioma declarado no caminho e o caminho sem prefixo. */
export function splitLocalePrefix(pathname: string): { locale: Locale | null; pathname: string } {
  const path = normalizePath(pathname);
  const [, first, ...rest] = path.split("/");
  const locale = first ? PREFIX_LOCALE[first] : undefined;
  if (!locale) return { locale: null, pathname: path };
  const stripped = rest.length ? `/${rest.join("/")}` : "/";
  return { locale, pathname: stripped };
}

/** Locale vindo do caminho, quando houver prefixo conhecido. */
export function localeFromPrefix(prefix: string | undefined | null): Locale | null {
  if (!prefix) return null;
  const short = prefix.toLowerCase();
  if (PREFIX_LOCALE[short]) return PREFIX_LOCALE[short];
  return isLocale(prefix) ? prefix : null;
}

/**
 * `alternates.languages` para o Next: cada idioma aponta para a sua URL real e
 * `x-default` aponta para o pt-BR (mesma URL da raiz).
 */
export function alternateLanguages(pathname: string): Record<string, string> {
  const path = normalizePath(pathname);
  return {
    "pt-BR": localePath(path, "pt-BR"),
    "pt-PT": localePath(path, "pt-PT"),
    "en-US": localePath(path, "en-US"),
    "es-ES": localePath(path, "es-ES"),
    "x-default": localePath(path, defaultLocale),
  };
}
