"use client";

import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";

import { LOCALE_COOKIE, localeLabels, locales, type Locale } from "@/i18n/config";
import { createTranslator, type Messages } from "@/i18n/runtime";
import { createFormatters } from "@/lib/format";

type I18nValue = {
  locale: Locale;
  t: (key: string, params?: Record<string, string | number>) => string;
  setLocale: (locale: Locale) => void;
  formatters: ReturnType<typeof createFormatters>;
};

const I18nContext = createContext<I18nValue | null>(null);

export default function I18nProvider({ locale, messages, currency = "BRL", timezone = "America/Sao_Paulo", children }: { locale: Locale; messages: Messages; currency?: string; timezone?: string; children: ReactNode }) {
  const t = useMemo(() => createTranslator(messages), [messages]);
  const formatters = useMemo(() => createFormatters(locale, currency, timezone), [locale, currency, timezone]);

  const setLocale = useCallback((next: Locale) => {
    // Cookie de 1 ano — usuários não autenticados também mantêm a escolha.
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax${window.location.protocol === "https:" ? "; secure" : ""}`;
    // Preferência do perfil (quando autenticado) — falha em silêncio para convidados.
    void import("@/lib/api/client").then(({ apiRequest }) =>
      apiRequest("/auth/preferences", { method: "PATCH", body: JSON.stringify({ locale: next }) }).catch(() => undefined),
    );
    window.location.reload();
  }, []);

  const value = useMemo(() => ({ locale, t, setLocale, formatters }), [locale, t, setLocale, formatters]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useI18n precisa estar dentro de <I18nProvider>.");
  return context;
}

/** Atalho: `const t = useT()` → t("customers.actions.create"). */
export function useT() {
  return useI18n().t;
}

export function useLocale() {
  return useI18n().locale;
}

export function useFormatters() {
  return useI18n().formatters;
}

/** Nome do idioma exibido ao usuário (nunca o código cru). */
export function useLocaleOptions() {
  return locales.map((locale) => ({ value: locale, label: localeLabels[locale].label }));
}

export { locales, localeLabels };
export type { Locale };
