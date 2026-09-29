import { normalizeLocale, type Locale } from "@/i18n/config";

import { CURRENCY_CODES, REGION_CODES, REGION_DEFAULT_CURRENCY, REGION_DEFAULT_TIMEZONE, type CurrencyCodeValue, type RegionCode } from "./options";

/**
 * Geolocalização por IP (sem API externa e sem permissão do navegador).
 *
 * Os cabeçalhos vêm da plataforma de hospedagem (Vercel/Cloudflare) quando existirem.
 * Quando não existem — desenvolvimento local, outras plataformas — o resultado é
 * `null` e a resolução de idioma simplesmente segue para o próximo sinal da cadeia.
 *
 * Cabeçalhos internos publicados pelo middleware: `x-mangora-geo-country`,
 * `x-mangora-geo-timezone`, `x-mangora-geo-locale`, `x-mangora-geo-currency`.
 */
export const GEO_COUNTRY_HEADERS = ["x-mangora-geo-country", "x-vercel-ip-country", "cf-ipcountry", "x-country-code"] as const;
export const GEO_TIMEZONE_HEADERS = ["x-mangora-geo-timezone", "x-vercel-ip-timezone", "cf-timezone"] as const;
export const GEO_REGION_HEADERS = ["x-mangora-geo-region", "x-vercel-ip-country-region", "cf-region-code"] as const;

/** País → idioma sugerido. Só entram aqui países com um idioma claramente dominante. */
export const COUNTRY_LOCALE: Record<string, Locale> = {
  BR: "pt-BR",
  PT: "pt-PT",
  US: "en-US",
  GB: "en-US",
  CA: "en-US",
  AU: "en-US",
  NZ: "en-US",
  IE: "en-US",
  ZA: "en-US",
  IN: "en-US",
  SG: "en-US",
  ES: "es-ES",
  MX: "es-ES",
  AR: "es-ES",
  CO: "es-ES",
  CL: "es-ES",
  PE: "es-ES",
  UY: "es-ES",
  PY: "es-ES",
  BO: "es-ES",
  EC: "es-ES",
  VE: "es-ES",
  CR: "es-ES",
  PA: "es-ES",
  DO: "es-ES",
  GT: "es-ES",
  SV: "es-ES",
  HN: "es-ES",
  NI: "es-ES",
  CU: "es-ES",
  PR: "es-ES",
};

/** País → região de precificação (mercado). Só existem regiões com moeda suportada. */
export const COUNTRY_REGION: Record<string, RegionCode> = {
  BR: "BR",
  PT: "PT",
  ES: "ES",
  MX: "MX",
  US: "US",
  CA: "CA",
  GB: "GB",
  AU: "AU",
};

export type GeoLocation = {
  country: string | null;
  region: RegionCode | null;
  timezone: string | null;
  /** Idioma sugerido pelo país — nunca aplicado sobre uma escolha explícita do usuário. */
  locale: Locale | null;
  /** Moeda sugerida pelo mercado (só quando o país tem região suportada). */
  currency: CurrencyCodeValue | null;
};

const COUNTRY_PATTERN = /^[A-Z]{2}$/;
const TIMEZONE_PATTERN = /^[A-Za-z]+(?:[_+-][A-Za-z0-9]+)*\/(?:[A-Za-z0-9_+-]+\/?)+$/;

/** Aceita apenas fuso IANA real (ex.: Europe/Lisbon); descarta "GMT-3", offset fixo ou lixo. */
export function isTimezone(value: string | null | undefined): boolean {
  if (!value) return false;
  const candidate = value.trim();
  if (!TIMEZONE_PATTERN.test(candidate)) return false;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: candidate });
    return true;
  } catch {
    return false;
  }
}

/** Normaliza o país recebido por cabeçalho (aceita "br", "BR", "br-" de provedores). */
export function normalizeCountry(value: string | null | undefined): string | null {
  if (!value) return null;
  const code = value.trim().toUpperCase().split("-")[0];
  if (!COUNTRY_PATTERN.test(code)) return null;
  if (code === "XX" || code === "T1") return null; // "desconhecido" (Cloudflare/Tor)
  return code;
}

export function localeForCountry(country: string | null | undefined): Locale | null {
  const code = normalizeCountry(country);
  if (!code) return null;
  const direct = COUNTRY_LOCALE[code];
  if (direct) return direct;
  return null;
}

/** Sugestão regional completa a partir do IP; campos não reconhecidos ficam `null`. */
export function geoLocation(input: { country?: string | null; timezone?: string | null }): GeoLocation {
  const country = normalizeCountry(input.country);
  const region = country ? COUNTRY_REGION[country] ?? null : null;
  const rawTimezone = input.timezone?.trim() ?? "";
  const timezone = isTimezone(rawTimezone) ? rawTimezone : null;
  return {
    country,
    region,
    timezone: timezone ?? (region ? REGION_DEFAULT_TIMEZONE[region] : null),
    locale: localeForCountry(country),
    currency: region ? REGION_DEFAULT_CURRENCY[region] : null,
  };
}

/** Lê a geolocalização dos cabeçalhos da requisição (funciona com `Headers` ou `ReadonlyHeaders`). */
export function geoFromHeaders(get: (name: string) => string | null | undefined): GeoLocation {
  const first = (names: readonly string[]) => {
    for (const name of names) {
      const value = get(name);
      if (value) return value;
    }
    return null;
  };
  return geoLocation({ country: first(GEO_COUNTRY_HEADERS), timezone: first(GEO_TIMEZONE_HEADERS) });
}

/** Cabeçalhos internos consumidos pelo render (middleware → servidor). */
export function geoHeaders(geo: GeoLocation): Record<string, string> {
  const headers: Record<string, string> = {};
  if (geo.country) headers["x-mangora-geo-country"] = geo.country;
  if (geo.timezone) headers["x-mangora-geo-timezone"] = geo.timezone;
  if (geo.locale) headers["x-mangora-geo-locale"] = geo.locale;
  if (geo.currency) headers["x-mangora-geo-currency"] = geo.currency;
  return headers;
}

/** Moeda sugerida para o país, validada contra as moedas suportadas. */
export function isSupportedCurrency(value: string | null | undefined): value is CurrencyCodeValue {
  return !!value && (CURRENCY_CODES as readonly string[]).includes(value);
}

/** Região suportada? Usado antes de pré-preencher o formulário de preferências. */
export function isSupportedRegion(value: string | null | undefined): value is RegionCode {
  return !!value && (REGION_CODES as readonly string[]).includes(value);
}

/** Idioma sugerido a partir de um valor livre (usado em teste/diagnóstico). */
export function suggestedLocale(value: string | null | undefined): Locale | null {
  return localeForCountry(value) ?? normalizeLocale(value);
}
