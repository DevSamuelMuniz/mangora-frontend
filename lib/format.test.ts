import { describe, expect, it } from "vitest";

import { formatCurrency, formatDate, formatDateLong, formatDateTime, formatDocument, formatNumber, formatPhone, formatPercent, formatTime, parseCurrency } from "./format";

describe("formatCurrency", () => {
    it("formata valores em BRL com separadores pt-BR", () => {
        // O Intl.NumberFormat pt-BR usa espaço não separável entre "R$" e o valor.
        expect(formatCurrency(1234.5)).toMatch(/R\$\s+1\.234,50/);
        expect(formatCurrency(0)).toMatch(/R\$\s+0,00/);
    });
});

describe("formatNumber", () => {
    it("usa separador de milhar pt-BR", () => {
        expect(formatNumber(12345)).toBe("12.345");
    });
});

describe("formatPercent", () => {
    it("formata percentual com 0 casas por padrão", () => {
        expect(formatPercent(12.5)).toBe("13%");
        expect(formatPercent(12.5, 1)).toBe("12,5%");
    });
});

describe("formatDate / formatDateTime / formatTime", () => {
    it("formata data curta dd/mm/aaaa", () => {
        expect(formatDate("2026-08-30T12:00:00.000Z")).toBe("30/08/2026");
    });
    it("formata data e hora no horário de Brasília", () => {
        expect(formatDateTime("2026-08-30T17:05:00.000Z")).toContain("14:05");
    });
    it("formata hora no horário de Brasília", () => {
        expect(formatTime("2026-08-30T17:05:00.000Z")).toBe("14:05");
    });
});

describe("formatDateLong", () => {
    it("capitaliza o primeiro caractere", () => {
        const result = formatDateLong("2026-08-30T12:00:00.000Z");
        expect(result.charAt(0)).toBe(result.charAt(0).toUpperCase());
    });
});

describe("formatDocument", () => {
    it("formata CPF", () => {
        expect(formatDocument("12345678901", "INDIVIDUAL")).toBe("123.456.789-01");
    });
    it("formata CNPJ", () => {
        expect(formatDocument("12345678000195", "COMPANY")).toBe("12.345.678/0001-95");
    });
});

describe("formatPhone", () => {
    it("formata celular (11 dígitos)", () => {
        expect(formatPhone("81991234567")).toBe("(81) 99123-4567");
    });
    it("formata fixo (10 dígitos)", () => {
        expect(formatPhone("8131234567")).toBe("(81) 3123-4567");
    });
});

describe("parseCurrency", () => {
    it("aceita valores inteiros digitados pelo caixa", () => {
        expect(parseCurrency("50")).toBe(50);
    });
    it("aceita vírgula como separador decimal", () => {
        expect(parseCurrency("50,00")).toBe(50);
        expect(parseCurrency("12,34")).toBe(12.34);
    });
    it("aceita ponto único como decimal (50.00)", () => {
        expect(parseCurrency("50.00")).toBe(50);
    });
    it("remove símbolos de moeda", () => {
        expect(parseCurrency("R$ 1.234,56")).toBe(1234.56);
    });
    it("trata pontos múltiplos como milhar", () => {
        expect(parseCurrency("1.234,56")).toBe(1234.56);
        expect(parseCurrency("1.234.567,89")).toBe(1234567.89);
    });
    it("retorna 0 para vazio ou inválido", () => {
        expect(parseCurrency("")).toBe(0);
        expect(parseCurrency("abc")).toBe(0);
    });
});
