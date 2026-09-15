export type MarketCode = "BR" | "US" | "EU" | "GB" | "CA" | "AU" | "MX" | "GLOBAL";
export type CurrencyCode = "BRL" | "USD" | "EUR" | "GBP" | "CAD" | "AUD" | "MXN";

export const marketCountries = [
  { country: "BR", label: "Brasil", currency: "BRL" },
  { country: "US", label: "Estados Unidos", currency: "USD" },
  { country: "PT", label: "Portugal", currency: "EUR" },
  { country: "GB", label: "Reino Unido", currency: "GBP" },
  { country: "CA", label: "Canadá", currency: "CAD" },
  { country: "AU", label: "Austrália", currency: "AUD" },
  { country: "MX", label: "México", currency: "MXN" },
] as const;

export type RegionalPrice = {
  planCode: string;
  planName: string;
  country: string;
  market: MarketCode;
  currency: CurrencyCode;
  amount: number;
  formatted: string;
  locale: string;
  provider: "ASAAS" | "PADDLE";
  providerPriceId: string | null;
  checkoutAvailable: boolean;
  source: "COUNTRY" | "MARKET" | "GLOBAL";
};

export function preferredCountry() {
  if (typeof document === "undefined") return "BR";
  return document.cookie.match(/(?:^|; )mangora_country=([A-Z]{2})(?:;|$)/)?.[1] ?? "BR";
}

export function savePreferredCountry(country: string) {
  document.cookie = `mangora_country=${country}; Path=/; Max-Age=31536000; SameSite=Lax; Secure`;
}

export function formatMinorUnits(amount: number, currency: CurrencyCode, locale: string) {
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(amount / 100);
}
