/**
 * Formatadores centralizados (fonte única de formatação pt-BR).
 *
 * Fase 2 — Core: substitui os `Intl.NumberFormat` / `Intl.DateTimeFormat`
 * duplicados em ~20 arquivos do frontend. Use SEMPRE estas funções nas
 * telas em vez de criar formatters locais.
 */
import { BRAZIL_TIME_ZONE } from "./timezone";

export type FormatLocale = "pt-BR" | "en-US" | "es-ES" | "pt-PT";
const DEFAULT_LOCALE: FormatLocale = "pt-BR";

type FormatterBundle = { currency: Intl.NumberFormat; dateLong: Intl.DateTimeFormat; dateShort: Intl.DateTimeFormat; dateTime: Intl.DateTimeFormat; time: Intl.DateTimeFormat };
const formatters = new Map<string, FormatterBundle>();
function bundle(locale: FormatLocale = DEFAULT_LOCALE, timeZone: string = BRAZIL_TIME_ZONE, currency = "BRL"): FormatterBundle {
    const key = `${locale}:${timeZone}:${currency}`;
    const cached = formatters.get(key);
    if (cached) return cached;
    const created: FormatterBundle = {
        currency: new Intl.NumberFormat(locale, { style: "currency", currency }),
        dateLong: new Intl.DateTimeFormat(locale, { timeZone, weekday: "long", day: "numeric", month: "long" }),
        dateShort: new Intl.DateTimeFormat(locale, { timeZone, day: "2-digit", month: "2-digit", year: "numeric" }),
        dateTime: new Intl.DateTimeFormat(locale, { timeZone, day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }),
        time: new Intl.DateTimeFormat(locale, { timeZone, hour: "2-digit", minute: "2-digit" }),
    };
    formatters.set(key, created);
    return created;
}

/** Formata um número como moeda BRL: 1234.5 -> "R$ 1.234,50". */
export function formatCurrency(value: number, locale: FormatLocale = DEFAULT_LOCALE, currency = "BRL"): string {
    return bundle(locale, BRAZIL_TIME_ZONE, currency).currency.format(value);
}

/** Formata um número com separador pt-BR: 12345 -> "12.345". */
export function formatNumber(value: number, locale: FormatLocale = DEFAULT_LOCALE): string {
    return value.toLocaleString(locale);
}

/** Formata um percentual: 12.5 -> "12,5%". */
export function formatPercent(value: number, digits = 0, locale: FormatLocale = DEFAULT_LOCALE): string {
    return `${value.toLocaleString(locale, {
        maximumFractionDigits: digits,
        minimumFractionDigits: digits,
    })}%`;
}

/** Percentual via Intl (0.125 -> "12,5%" em pt-BR, "12.5%" em en-US). */
export function formatPercentage(ratio: number, locale: FormatLocale = DEFAULT_LOCALE, digits = 1): string {
    return new Intl.NumberFormat(locale, { style: "percent", maximumFractionDigits: digits }).format(ratio);
}

/** Data longa com capitalização inicial: "sexta-feira, 30 de agosto". */
export function formatDateLong(date: Date | string, locale: FormatLocale = DEFAULT_LOCALE, timeZone = BRAZIL_TIME_ZONE): string {
    const value = typeof date === "string" ? new Date(date) : date;
    const formatted = bundle(locale, timeZone).dateLong.format(value);
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

/** Data curta: 30/08/2026. */
export function formatDate(date: Date | string, locale: FormatLocale = DEFAULT_LOCALE, timeZone = BRAZIL_TIME_ZONE): string {
    const value = typeof date === "string" ? new Date(date) : date;
    return bundle(locale, timeZone).dateShort.format(value);
}

/** Data e hora: 30/08/2026 14:05. */
export function formatDateTime(date: Date | string, locale: FormatLocale = DEFAULT_LOCALE, timeZone = BRAZIL_TIME_ZONE): string {
    const value = typeof date === "string" ? new Date(date) : date;
    return bundle(locale, timeZone).dateTime.format(value);
}

/** Hora: 14:05. */
export function formatTime(date: Date | string, locale: FormatLocale = DEFAULT_LOCALE, timeZone = BRAZIL_TIME_ZONE): string {
    const value = typeof date === "string" ? new Date(date) : date;
    return bundle(locale, timeZone).time.format(value);
}

/** Formata CPF (11 dígitos) ou CNPJ (14 dígitos) conforme o tipo de cliente. */
export function formatDocument(document: string, type: "INDIVIDUAL" | "COMPANY"): string {
    return type === "INDIVIDUAL"
        ? document.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4")
        : document.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
}

/** Formata telefone fixo/celular brasileiro: (11) 91234-5678. */
export function formatPhone(phone: string): string {
    return phone.length === 11
        ? phone.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3")
        : phone.replace(/^(\d{2})(\d{4})(\d{4})$/, "($1) $2-$3");
}

/**
 * Converte texto digitado pelo caixa em valor numérico (pt-BR).
 * Aceita "50", "50,00", "50.00" e "R$ 1.234,56".
 */
export function parseCurrency(value: string): number {
    const cleaned = value.replace(/[^\d,.]/g, "").trim();
    if (!cleaned) return 0;
    let normalized = cleaned;
    if (normalized.includes(",")) {
        // vírgula = separador decimal; pontos = milhar
        normalized = normalized.replace(/\./g, "").replace(",", ".");
    } else if ((normalized.match(/\./g) ?? []).length > 1) {
        // múltiplos pontos = milhar
        normalized = normalized.replace(/\./g, "");
    }
    const result = Number(normalized);
    return Number.isFinite(result) ? result : 0;
}

/** Formatadores por request/render; idioma, moeda e fuso são independentes. */
export function createFormatters(locale: FormatLocale, currency = "BRL", timeZone = BRAZIL_TIME_ZONE) {
    return {
        formatCurrency: (value: number, language = locale, unit = currency) => formatCurrency(value, language, unit),
        formatNumber: (value: number, language = locale) => formatNumber(value, language),
        formatPercent: (value: number, digits = 0, language = locale) => formatPercent(value, digits, language),
        formatPercentage: (value: number, language = locale, digits = 1) => formatPercentage(value, language, digits),
        formatDate: (value: Date | string, language = locale) => formatDate(value, language, timeZone),
        formatDateLong: (value: Date | string, language = locale) => formatDateLong(value, language, timeZone),
        formatDateTime: (value: Date | string, language = locale) => formatDateTime(value, language, timeZone),
        formatTime: (value: Date | string, language = locale) => formatTime(value, language, timeZone),
    };
}
