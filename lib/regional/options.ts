import { locales, type Locale } from "@/i18n/config";

export const REGION_CODES = ["BR", "US", "PT", "ES", "MX", "CA", "GB", "AU"] as const;
export type RegionCode = (typeof REGION_CODES)[number];

export const CURRENCY_CODES = ["BRL", "USD", "EUR", "GBP", "CAD", "AUD", "MXN"] as const;
export type CurrencyCodeValue = (typeof CURRENCY_CODES)[number];

/** Fuso padrão sugerido por região (o usuário pode trocar por qualquer IANA). */
export const REGION_DEFAULT_TIMEZONE: Record<RegionCode, string> = {
  BR: "America/Sao_Paulo",
  US: "America/New_York",
  PT: "Europe/Lisbon",
  ES: "Europe/Madrid",
  MX: "America/Mexico_City",
  CA: "America/Toronto",
  GB: "Europe/London",
  AU: "Australia/Sydney",
};

export const REGION_DEFAULT_CURRENCY: Record<RegionCode, CurrencyCodeValue> = {
  BR: "BRL",
  US: "USD",
  PT: "EUR",
  ES: "EUR",
  MX: "MXN",
  CA: "CAD",
  GB: "GBP",
  AU: "AUD",
};

/** Fuso IANA — nunca usar offsets fixos (horário de verão muda). */
export const TIME_ZONE_OPTIONS = [
  "America/Sao_Paulo",
  "America/Recife",
  "America/Manaus",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Mexico_City",
  "America/Toronto",
  "Europe/Lisbon",
  "Europe/Madrid",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Australia/Sydney",
  "UTC",
] as const;

/** Nome do país no idioma do usuário (sem tabela hardcoded). */
export function regionName(code: string, locale: Locale): string {
  try {
    return new Intl.DisplayNames([locale], { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
}

/** Nome da moeda no idioma do usuário (ex.: "Real brasileiro"). */
export function currencyName(code: string, locale: Locale): string {
  try {
    return new Intl.DisplayNames([locale], { type: "currency" }).of(code) ?? code;
  } catch {
    return code;
  }
}

export function localeName(value: Locale): string {
  return new Intl.DisplayNames([value], { type: "language" }).of(value.split("-")[0]) ?? value;
}

export function isSupportedLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}
