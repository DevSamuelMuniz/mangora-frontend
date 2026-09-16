import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { defaultLocale, locales, normalizeLocale, resolveLocale } from "@/i18n/config";
import { fallbackChain, mergeMessages, translate, translateList } from "@/i18n/runtime";
import { createFormatters, formatCurrency, formatDate, formatNumber, formatPercent, formatPercentage } from "@/lib/format";

describe("resolveLocale", () => {
  it("prioriza perfil, caminho e cookie antes da negociação HTTP", () => {
    expect(resolveLocale({ preference: "pt-PT", path: "en-US", cookie: "es-ES" })).toBe("pt-PT");
    expect(resolveLocale({ path: "en-US", cookie: "es-ES" })).toBe("en-US");
  });

  it("respeita pesos, exclusões, empates e pesos inválidos", () => {
    expect(resolveLocale({ acceptLanguage: "en;q=0.2,es;q=0.9" })).toBe("es-ES");
    expect(resolveLocale({ acceptLanguage: "en;q=0,es;q=1" })).toBe("es-ES");
    expect(resolveLocale({ acceptLanguage: "pt-PT;q=0.5,en;q=0.5" })).toBe("pt-PT");
    expect(resolveLocale({ acceptLanguage: "en;q=bad,es;q=2,pt-PT;q=0.8" })).toBe("pt-PT");
    expect(resolveLocale({ acceptLanguage: "de;q=1,es;q=0.8" })).toBe("es-ES");
  });
  it("segue a cadeia preferência → cookie → Accept-Language → fallback", () => {
    expect(resolveLocale({ preference: "en-US", cookie: "es-ES", acceptLanguage: "pt-BR" })).toBe("en-US");
    expect(resolveLocale({ cookie: "es-ES", acceptLanguage: "pt-BR" })).toBe("es-ES");
    expect(resolveLocale({ acceptLanguage: "en-US,en;q=0.9,es;q=0.8" })).toBe("en-US");
    expect(resolveLocale({ acceptLanguage: "de-DE,fr;q=0.9" })).toBe(defaultLocale);
    expect(resolveLocale({})).toBe(defaultLocale);
  });

  it("normaliza variantes de idioma", () => {
    expect(normalizeLocale("pt")).toBe("pt-BR");
    expect(normalizeLocale("en")).toBe("en-US");
    expect(normalizeLocale("en-GB")).toBe("en-US");
    expect(normalizeLocale("es-MX")).toBe("es-ES");
    expect(normalizeLocale("pt-PT")).toBe("pt-PT");
    expect(normalizeLocale("xx-XX")).toBeNull();
  });
});

describe("fallbackChain", () => {
  it("aplica pt-BR como fallback dos outros idiomas", () => {
    expect(fallbackChain("pt-PT")).toEqual(["pt-PT", "pt-BR"]);
    expect(fallbackChain("en-US")).toEqual(["en-US", "pt-BR"]);
    expect(fallbackChain("pt-BR")).toEqual(["pt-BR"]);
  });
});

describe("mergeMessages", () => {
  it("substitui listas inteiras sem transformar arrays em objetos nem manter itens antigos", () => {
    const base = { nested: { items: ["Base", "Extra"], retained: "Fallback" } };
    const merged = mergeMessages(base, { nested: { items: ["Translated"] } });
    expect(translateList(merged, "nested.items")).toEqual(["Translated"]);
    expect(translate(merged, "nested.items.0")).toBe("Translated");
    expect(translate(merged, "nested.retained")).toBe("Fallback");
    expect(base.nested.items).toEqual(["Base", "Extra"]);
    expect(translateList(mergeMessages(base, { nested: { items: [] } }), "nested.items")).toEqual([]);
  });
});

describe("translate", () => {
  const messages = {
    common: { actions: { save: "Salvar" }, plurals: { productsOne: "{count} produto", productsOther: "{count} produtos" } },
  };

  it("interpola {placeholder}", () => {
    expect(translate({ greeting: "Olá, {name}" }, "greeting", { name: "Samuel" })).toBe("Olá, Samuel");
  });

  it("usa plural One/Other quando count é informado", () => {
    expect(translate(messages, "common.plurals.products", { count: 1 })).toBe("1 produto");
    expect(translate(messages, "common.plurals.products", { count: 3 })).toBe("3 produtos");
  });

  it("devolve a chave quando a tradução não existe", () => {
    expect(translate(messages, "missing.key")).toBe("missing.key");
  });

  it("resolve itens de listas por índice (ex.: páginas informativas)", () => {
    const list = { support: { items: ["Primeiro", "Segundo"] } };
    expect(translate(list, "support.items.0")).toBe("Primeiro");
    expect(translate(list, "support.items.1")).toBe("Segundo");
    expect(translate(list, "support.items.9")).toBe("support.items.9");
    expect(translateList(list, "support.items")).toEqual(["Primeiro", "Segundo"]);
    expect(translateList(list, "support.missing")).toEqual([]);
  });
});

function keyPaths(value: Record<string, unknown>, prefix = ""): string[] {
  return Object.entries(value).flatMap(([key, item]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return typeof item === "object" && item !== null ? keyPaths(item as Record<string, unknown>, path) : [path];
  });
}

describe("catálogos de mensagens", () => {
  const namespaces = readdirSync(join(process.cwd(), "messages", "pt-BR")).map((file) => file.replace(".json", ""));

  it("todos os locales têm as mesmas chaves do pt-BR em cada namespace", () => {
    for (const namespace of namespaces) {
      const base = JSON.parse(readFileSync(join(process.cwd(), "messages", "pt-BR", `${namespace}.json`), "utf8")) as Record<string, unknown>;
      const basePaths = keyPaths(base).sort();
      for (const locale of locales) {
        const target = JSON.parse(readFileSync(join(process.cwd(), "messages", locale, `${namespace}.json`), "utf8")) as Record<string, unknown>;
        expect(keyPaths(target).sort(), `${locale}/${namespace}`).toEqual(basePaths);
      }
    }
  });
});

describe("formatação por locale", () => {
  it("moeda, número e percentual seguem o locale", () => {
    expect(formatNumber(1500.5, "pt-BR")).toBe("1.500,5");
    expect(formatNumber(1500.5, "en-US")).toBe("1,500.5");
    expect(formatCurrency(1249.9, "pt-BR")).toContain("1.249,90");
    expect(formatCurrency(1249.9, "en-US")).toBe("R$1,249.90");
    expect(formatCurrency(1249.9, "en-US", "USD")).toBe("$1,249.90");
    expect(formatPercentage(0.125, "en-US", 1)).toBe("12.5%");
    expect(formatPercent(12.5, 1, "pt-BR")).toBe("12,5%");
  });

  it("data curta respeita a ordem do locale", () => {
    const date = new Date("2026-09-15T15:00:00.000Z");
    expect(formatDate(date)).toBe("15/09/2026");
  });

  it("mantém moeda e fuso independentes do idioma e isolados entre formatadores", () => {
    const english = createFormatters("en-US", "BRL", "UTC");
    const portuguese = createFormatters("pt-BR", "BRL", "America/Sao_Paulo");
    const dollars = createFormatters("en-US", "USD", "America/Sao_Paulo");
    const date = "2026-09-16T01:00:00Z";
    expect(english.formatCurrency(1249.9)).toBe("R$1,249.90");
    expect(portuguese.formatCurrency(1249.9)).toMatch(/R\$\s1\.249,90/);
    expect(dollars.formatCurrency(1249.9)).toBe("$1,249.90");
    expect(english.formatDate(date)).toBe("09/16/2026");
    expect(dollars.formatDate(date)).toBe("09/15/2026");
    expect(english.formatDate(date)).toBe("09/16/2026");
    expect(english.formatCurrency(1249.9)).toBe("R$1,249.90");
  });
});
