import React from "react";
import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import I18nProvider, { useFormatters } from "@/i18n/provider";
import { usePreferredCountry } from "@/lib/regional/use-preferred-country";
import { savePreferredCountry } from "@/lib/international";

afterEach(() => {
  cleanup();
  document.cookie = "mangora_country=; Path=/; Max-Age=0";
});

function Amount() {
  const { formatCurrency, formatDate } = useFormatters();
  return <output>{formatCurrency(1200.5)} | {formatDate("2026-09-16T01:00:00Z")}</output>;
}

function Country() {
  const [country] = usePreferredCountry();
  return <output>{country}</output>;
}

describe("preferências regionais na interface", () => {
  it("atualiza o idioma sem mudar a moeda e usa o fuso configurado", () => {
    const { rerender } = render(<I18nProvider locale="en-US" messages={{}} currency="BRL" timezone="UTC"><Amount /></I18nProvider>);
    expect(screen.getByRole("status").textContent).toBe("R$1,200.50 | 09/16/2026");
    rerender(<I18nProvider locale="pt-BR" messages={{}} currency="BRL" timezone="America/Sao_Paulo"><Amount /></I18nProvider>);
    expect(screen.getByRole("status").textContent).toMatch(/R\$\s1\.200,50 \| 15\/09\/2026/);
  });

  it("lê a preferência existente e sincroniza alterações entre seletores", () => {
    savePreferredCountry("PT");
    render(<><Country /><Country /></>);
    expect(screen.getAllByRole("status").map((node) => node.textContent)).toEqual(["PT", "PT"]);
    act(() => savePreferredCountry("US"));
    expect(screen.getAllByRole("status").map((node) => node.textContent)).toEqual(["US", "US"]);
  });
});
