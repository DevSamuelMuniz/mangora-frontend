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

/**
 * Ordem oficial dos sinais, do mais forte ao mais fraco:
 * preferência do perfil → caminho com prefixo → cookie → Accept-Language →
 * país detectado por IP → pt-BR. Usada em documentação e testes.
 */
export const localeResolutionOrder = ["preference", "path", "cookie", "acceptLanguage", "country"] as const;

/** Cadeia: preferência salva → caminho → cookie → Accept-Language → país detectado → fallback pt-BR. */
export function resolveLocale(input: { preference?: string | null; path?: string | null; cookie?: string | null; acceptLanguage?: string | null; countryLocale?: string | null }): Locale {
  const fromPreference = normalizeLocale(input.preference);
  if (fromPreference) return fromPreference;
  const fromPath = normalizeLocale(input.path);
  if (fromPath) return fromPath;
  const fromCookie = normalizeLocale(input.cookie);
  if (fromCookie) return fromCookie;
  if (input.acceptLanguage) {
    const accepted = input.acceptLanguage.split(",").map((part) => {
      const [tag, ...parameters] = part.trim().split(";");
      const quality = parameters.map((parameter) => parameter.trim()).find((parameter) => /^q\s*=/i.test(parameter));
      const raw = quality?.split("=")[1]?.trim();
      const weight = raw === undefined ? 1 : /^(?:0(?:\.\d{0,3})?|1(?:\.0{0,3})?)$/.test(raw) ? Number(raw) : 0;
      return { tag, weight };
    }).filter(({ weight }) => weight > 0).sort((a, b) => b.weight - a.weight);
    for (const { tag } of accepted) {
      const resolved = normalizeLocale(tag);
      if (resolved) return resolved;
    }
  }
  // Último sinal antes do padrão: país detectado por IP (sugestão — nunca sobrepõe escolha explícita).
  const fromCountry = normalizeLocale(input.countryLocale);
  if (fromCountry) return fromCountry;
  return defaultLocale;
}
