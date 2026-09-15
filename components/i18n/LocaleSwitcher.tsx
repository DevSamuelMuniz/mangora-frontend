"use client";

import { Languages } from "lucide-react";

import { localeLabels, locales, useI18n } from "@/i18n/provider";

type LocaleSwitcherProps = {
  /** "dark" para superfícies escuras (sidebar/PDV); "light" para cards brancos. */
  tone?: "light" | "dark";
  className?: string;
};

/** Seletor de idioma — salva em cookie e recarrega a experiência no novo locale. */
export default function LocaleSwitcher({ tone = "light", className = "" }: LocaleSwitcherProps) {
  const { locale, setLocale, t } = useI18n();
  const toneClass = tone === "dark"
    ? "border-white/20 bg-white/10 text-white hover:bg-white/15"
    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50";
  return (
    <label className={`inline-flex h-10 items-center gap-2 rounded-xl border px-3 text-xs font-bold ${toneClass} ${className}`}>
      <Languages className="size-4 opacity-70" aria-hidden />
      <span className="sr-only">{t("common.language.change")}</span>
      <select
        value={locale}
        aria-label={t("common.language.change")}
        onChange={(event) => setLocale(event.target.value as (typeof locales)[number])}
        className="bg-transparent text-xs font-bold outline-none"
      >
        {locales.map((item) => <option key={item} value={item} className="text-slate-900">{localeLabels[item].label}</option>)}
      </select>
    </label>
  );
}
