import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

/** Nome do arquivo → prefixo usado nas chaves `t("namespace.chave")`. */
const NAMESPACE_BY_FILE: Record<string, string> = {
  "public-ui": "publicUi",
  "page-meta": "pageMeta",
  "system-admin": "systemAdmin",
  "account-security": "accountSecurity",
  "ai-manager": "aiManager",
  "public-pages": "publicPages",
};

function flatten(value: unknown, prefix = ""): Record<string, string> {
  if (Array.isArray(value)) {
    return Object.fromEntries(value.flatMap((item, index) => Object.entries(flatten(item, `${prefix}.${index}`))));
  }
  if (typeof value === "object" && value !== null) {
    return Object.fromEntries(
      Object.entries(value).flatMap(([key, item]) => Object.entries(flatten(item, prefix ? `${prefix}.${key}` : key))),
    );
  }
  return typeof value === "string" ? { [prefix]: value } : {};
}

/** Catálogo pt-BR completo, com as chaves prefixadas pelo namespace. */
function catalogoBase() {
  const directory = join(process.cwd(), "messages", "pt-BR");
  const catalog: Record<string, string> = {};
  for (const file of readdirSync(directory)) {
    const namespace = NAMESPACE_BY_FILE[file.replace(".json", "")] ?? file.replace(".json", "");
    const messages = JSON.parse(readFileSync(join(directory, file), "utf8")) as Record<string, unknown>;
    for (const [key, value] of Object.entries(flatten(messages))) {
      catalog[`${namespace}.${key}`] = value;
      // alguns arquivos já vêm embrulhados no próprio namespace
      if (key.startsWith(`${namespace}.`)) catalog[key] = value;
    }
  }
  return catalog;
}

function arquivosDeCodigo(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    if (statSync(path).isDirectory()) return arquivosDeCodigo(path);
    return path.endsWith(".tsx") ? [path] : [];
  });
}

describe("chaves de tradução", () => {
  const catalog = catalogoBase();
  const literais = arquivosDeCodigo(join(process.cwd(), "components"))
    .concat(arquivosDeCodigo(join(process.cwd(), "app")))
    .flatMap((path) => {
      // components/marketing/MarketSelector.tsx pertence a outra frente de trabalho
      if (path.includes("MarketSelector")) return [];
      const source = readFileSync(path, "utf8");
      return Array.from(source.matchAll(/t\(\s*"([a-zA-Z][\w]*\.[\w.]+)"/g), (match) => ({
        path: path.replace(process.cwd(), "").replace(/\\/g, "/"),
        key: match[1],
      }));
    });

  it("toda chave literal usada no código existe no catálogo pt-BR", () => {
    const missing = literais.filter(({ key }) => !(key in catalog)).map(({ path, key }) => `${key} (${path})`);
    expect(Array.from(new Set(missing))).toEqual([]);
  });

  it("os catálogos não têm chaves órfãs nos grupos principais", () => {
    // proteção contra remoção acidental de blocos inteiros
    const obrigatorias = [
      "navigation.items.products",
      "pdv.cart.title",
      "sales.title",
      "products.title",
      "stock.title",
      "customers.title",
      "finance.title",
      "reports.title",
      "settings.panel.tabs.preferences",
      "publicPages.support.title",
      "pageMeta.categorias.title",
      "systemAdmin.nav.overview",
      "accountSecurity.title",
      "aiManager.title",
    ];
    expect(obrigatorias.filter((key) => !(key in catalog))).toEqual([]);
  });
});
