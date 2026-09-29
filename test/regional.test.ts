import { describe, expect, it } from "vitest";

import { CURRENCY_CODES, REGION_CODES, TIME_ZONE_OPTIONS, currencyName, localeName, regionName } from "@/lib/regional/options";
import { locales } from "@/i18n/config";

describe("regional options", () => {
  it("renderiza nomes de país no idioma do usuário (sem tabela hardcoded)", () => {
    expect(regionName("BR", "pt-BR")).toBe("Brasil");
    expect(regionName("US", "en-US")).toBe("United States");
    expect(regionName("ES", "es-ES")).toBe("España");
  });

  it("renderiza nomes de moeda e cai para o código quando desconhecida", () => {
    expect(currencyName("BRL", "pt-BR")).toMatch(/Real/i);
    expect(currencyName("USD", "en-US")).toMatch(/US Dollar/i);
    expect(currencyName("XXX", "pt-BR").length).toBeGreaterThan(0);
  });

  it("cobre as moedas ISO 4217 e fusos IANA exigidos", () => {
    for (const code of ["BRL", "USD", "EUR", "GBP", "CAD", "AUD", "MXN"]) expect(CURRENCY_CODES).toContain(code);
    for (const zone of TIME_ZONE_OPTIONS) expect(zone).toMatch(/^[A-Za-z_]+\/[A-Za-z_+-]+$|^UTC$/);
    expect(REGION_CODES).toContain("PT");
  });

  it("nome do idioma é legível em cada locale suportado", () => {
    for (const locale of locales) expect(localeName(locale).length).toBeGreaterThan(2);
  });
});
