export const locales = ["pt-BR", "en-US", "es-ES", "pt-PT"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "pt-BR";
export const LOCALE_COOKIE = "MANGORA_LOCALE";
/** Fallback de tradução: pt-PT pode herdar do pt-BR; en-US/es-ES devem ter catálogo completo. */
export const fallbackLocale: Partial<Record<Locale, Locale>> = { "pt-PT": "pt-BR" };

/** Nomes exibidos ao usuário (nunca mostrar o código cru quando não for necessário). */
export const localeLabels: Record<Locale, { label: string; short: string }> = {
  "pt-BR": { label: "Português (Brasil)", short: "PT" },
  "en-US": { label: "English", short: "EN" },
  "es-ES": { label: "Español", short: "ES" },
  "pt-PT": { label: "Português (Portugal)", short: "PT" },
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (locales as readonly string[]).includes(value);
}

/** Aceita "en", "en-GB", "pt" e mapeia para o locale suportado mais próximo. */
export function normalizeLocale(value: string | null | undefined): Locale | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (isLocale(trimmed)) return trimmed;
  const lower = trimmed.toLowerCase();
  const exact = locales.find((locale) => locale.toLowerCase() === lower);
  if (exact) return exact;
  const language = lower.split(/[-_]/)[0];
  if (language === "pt") return "pt-BR";
  if (language === "en") return "en-US";
  if (language === "es") return "es-ES";
  const byPrefix = locales.find((locale) => locale.toLowerCase().startsWith(`${language}-`));
  return byPrefix ?? null;
}

/** Cadeia: preferência salva → cookie → Accept-Language → fallback pt-BR. */
export function resolveLocale(input: { preference?: string | null; cookie?: string | null; acceptLanguage?: string | null }): Locale {
  const fromPreference = normalizeLocale(input.preference);
  if (fromPreference) return fromPreference;
  const fromCookie = normalizeLocale(input.cookie);
  if (fromCookie) return fromCookie;
  if (input.acceptLanguage) {
    // "en-US,en;q=0.9,es;q=0.8" — testa na ordem de prioridade declarada.
    for (const part of input.acceptLanguage.split(",")) {
      const tag = part.split(";")[0];
      const resolved = normalizeLocale(tag);
      if (resolved) return resolved;
    }
  }
  return defaultLocale;
}
