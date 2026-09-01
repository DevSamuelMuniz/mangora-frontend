/**
 * Formatadores centralizados (fonte única de formatação pt-BR).
 *
 * Fase 2 — Core: substitui os `Intl.NumberFormat` / `Intl.DateTimeFormat`
 * duplicados em ~20 arquivos do frontend. Use SEMPRE estas funções nas
 * telas em vez de criar formatters locais.
 */
import { BRAZIL_TIME_ZONE } from "./timezone";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

const dateLong = new Intl.DateTimeFormat("pt-BR", {
    timeZone: BRAZIL_TIME_ZONE,
    weekday: "long",
    day: "numeric",
    month: "long",
});

const dateShort = new Intl.DateTimeFormat("pt-BR", {
    timeZone: BRAZIL_TIME_ZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
});

const dateTime = new Intl.DateTimeFormat("pt-BR", {
    timeZone: BRAZIL_TIME_ZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
});

const timeOnly = new Intl.DateTimeFormat("pt-BR", {
    timeZone: BRAZIL_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
});

/** Formata um número como moeda BRL: 1234.5 -> "R$ 1.234,50". */
export function formatCurrency(value: number): string {
    return currency.format(value);
}

/** Formata um número com separador pt-BR: 12345 -> "12.345". */
export function formatNumber(value: number): string {
    return value.toLocaleString("pt-BR");
}

/** Formata um percentual: 12.5 -> "12,5%". */
export function formatPercent(value: number, digits = 0): string {
    return `${value.toLocaleString("pt-BR", {
        maximumFractionDigits: digits,
        minimumFractionDigits: digits,
    })}%`;
}

/** Data longa com capitalização inicial: "sexta-feira, 30 de agosto". */
export function formatDateLong(date: Date | string): string {
    const value = typeof date === "string" ? new Date(date) : date;
    const formatted = dateLong.format(value);
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

/** Data curta: 30/08/2026. */
export function formatDate(date: Date | string): string {
    const value = typeof date === "string" ? new Date(date) : date;
    return dateShort.format(value);
}

/** Data e hora: 30/08/2026 14:05. */
export function formatDateTime(date: Date | string): string {
    const value = typeof date === "string" ? new Date(date) : date;
    return dateTime.format(value);
}

/** Hora: 14:05. */
export function formatTime(date: Date | string): string {
    const value = typeof date === "string" ? new Date(date) : date;
    return timeOnly.format(value);
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
