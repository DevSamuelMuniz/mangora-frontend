import { defaultLocale, fallbackLocale, type Locale } from "./config";

export type Messages = Record<string, unknown>;
export type Translate = (key: string, params?: Record<string, string | number>) => string;

function lookup(messages: Messages, key: string): string | undefined {
  const segments = key.split(".");
  let current: unknown = messages;
  for (const segment of segments) {
    if (typeof current !== "object" || current === null) return undefined;
    current = (current as Record<string, unknown>)[segment];
  }
  return typeof current === "string" ? current : undefined;
}

function interpolate(template: string, params?: Record<string, string | number>) {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) => (name in params ? String(params[name]) : match));
}

/**
 * Tradução com pluralização simples (chaves `...One`/`...Other` quando `count`
 * é informado) e interpolação `{placeholder}`. Nunca lança: devolve a chave
 * quando a tradução não existe e avisa no console em desenvolvimento.
 */
export function translate(messages: Messages, key: string, params?: Record<string, string | number>): string {
  let value: string | undefined;
  const count = params?.count;
  if (typeof count === "number") {
    value = lookup(messages, `${key}${count === 1 ? "One" : "Other"}`);
  }
  value ??= lookup(messages, key);
  if (value === undefined) {
    if (process.env.NODE_ENV !== "production") console.warn(`[i18n] Missing translation: ${key}`);
    return key;
  }
  return interpolate(value, params);
}

export function createTranslator(messages: Messages): Translate {
  return (key, params) => translate(messages, key, params);
}

/** Mescla o catálogo com o fallback (pt-PT → pt-BR) sem perder chaves novas. */
export function mergeMessages(base: Messages, override: Messages): Messages {
  const result: Messages = { ...base };
  for (const [key, value] of Object.entries(override)) {
    const current = result[key];
    result[key] = typeof value === "object" && value !== null && typeof current === "object" && current !== null
      ? mergeMessages(current as Messages, value as Messages)
      : value;
  }
  return result;
}

export function fallbackChain(locale: Locale): Locale[] {
  const chain: Locale[] = [locale];
  let next: Locale | undefined = fallbackLocale[locale];
  while (next && !chain.includes(next)) {
    chain.push(next);
    next = fallbackLocale[next];
  }
  if (!chain.includes(defaultLocale)) chain.push(defaultLocale);
  return chain;
}
