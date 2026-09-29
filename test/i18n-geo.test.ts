import { describe, expect, it } from "vitest";

import { resolveLocale } from "@/i18n/config";
import { CURRENCY_CODES, REGION_CODES, TIME_ZONE_OPTIONS } from "@/lib/regional/options";
import { COUNTRY_LOCALE, geoFromHeaders, geoHeaders, geoLocation, localeForCountry, normalizeCountry, suggestedLocale } from "@/lib/regional/geo";

describe("normalizeCountry", () => {
  it("aceita variações vindas de provedores diferentes", () => {
    expect(normalizeCountry("br")).toBe("BR");
    expect(normalizeCountry(" pt ")).toBe("PT");
    expect(normalizeCountry("US-CA")).toBe("US");
  });

  it("descarta valores inválidos ou de país desconhecido", () => {
    expect(normalizeCountry(null)).toBeNull();
    expect(normalizeCountry("")).toBeNull();
    expect(normalizeCountry("Brasil")).toBeNull();
    expect(normalizeCountry("XX")).toBeNull();
    expect(normalizeCountry("T1")).toBeNull();
  });
});

describe("localeForCountry", () => {
  it("sugere o idioma do país quando há um idioma dominante", () => {
    expect(localeForCountry("BR")).toBe("pt-BR");
    expect(localeForCountry("PT")).toBe("pt-PT");
    expect(localeForCountry("US")).toBe("en-US");
    expect(localeForCountry("ES")).toBe("es-ES");
    expect(localeForCountry("MX")).toBe("es-ES");
  });

  it("não chuta idioma para países sem idioma mapeado", () => {
    expect(localeForCountry("DE")).toBeNull();
    expect(localeForCountry("JP")).toBeNull();
    expect(localeForCountry(null)).toBeNull();
  });

  it("todos os idiomas sugeridos estão entre os suportados", () => {
    for (const locale of Object.values(COUNTRY_LOCALE)) {
      expect(["pt-BR", "en-US", "es-ES", "pt-PT"]).toContain(locale);
    }
  });
});

describe("geoLocation", () => {
  it("devolve país, região, moeda e fuso coerentes", () => {
    const pt = geoLocation({ country: "PT" });
    expect(pt).toEqual({ country: "PT", region: "PT", timezone: "Europe/Lisbon", locale: "pt-PT", currency: "EUR" });
  });

  it("usa o fuso informado pelo provedor quando ele é válido", () => {
    expect(geoLocation({ country: "BR", timezone: "America/Recife" }).timezone).toBe("America/Recife");
  });

  it("ignora fuso inválido e cai no padrão da região", () => {
    expect(geoLocation({ country: "BR", timezone: "GMT-3" }).timezone).toBe("America/Sao_Paulo");
    expect(geoLocation({ country: "BR", timezone: "<script>" }).timezone).toBe("America/Sao_Paulo");
  });

  it("sem país detectado não sugere nada", () => {
    expect(geoLocation({})).toEqual({ country: null, region: null, timezone: null, locale: null, currency: null });
  });

  it("país sem região de precificação mantém moeda nula, mas sugere idioma", () => {
    const ar = geoLocation({ country: "AR" });
    expect(ar.region).toBeNull();
    expect(ar.currency).toBeNull();
    expect(ar.locale).toBe("es-ES");
  });

  it("moeda e fuso sugeridos existem nas listas suportadas", () => {
    for (const country of Object.keys(COUNTRY_LOCALE)) {
      const geo = geoLocation({ country });
      if (geo.region) expect(REGION_CODES).toContain(geo.region);
      if (geo.currency) expect(CURRENCY_CODES).toContain(geo.currency);
      if (geo.timezone) expect(TIME_ZONE_OPTIONS).toContain(geo.timezone);
    }
  });
});

describe("geoFromHeaders", () => {
  it("lê o cabeçalho da Vercel", () => {
    const headers = new Map([["x-vercel-ip-country", "ES"], ["x-vercel-ip-timezone", "Europe/Madrid"]]);
    expect(geoFromHeaders((name) => headers.get(name))).toEqual({ country: "ES", region: "ES", timezone: "Europe/Madrid", locale: "es-ES", currency: "EUR" });
  });

  it("lê o cabeçalho da Cloudflare", () => {
    const headers = new Map([["cf-ipcountry", "PT"]]);
    expect(geoFromHeaders((name) => headers.get(name)).locale).toBe("pt-PT");
  });

  it("prioriza o cabeçalho interno (permite teste e proxy próprio)", () => {
    const headers = new Map([["x-mangora-geo-country", "BR"], ["x-vercel-ip-country", "US"]]);
    expect(geoFromHeaders((name) => headers.get(name)).country).toBe("BR");
  });

  it("sem cabeçalhos devolve tudo nulo (dev local)", () => {
    expect(geoFromHeaders(() => null).country).toBeNull();
    expect(geoFromHeaders(() => undefined).locale).toBeNull();
  });
});

describe("geoHeaders", () => {
  it("publica apenas os valores detectados", () => {
    expect(geoHeaders(geoLocation({ country: "PT" }))).toEqual({
      "x-mangora-geo-country": "PT",
      "x-mangora-geo-timezone": "Europe/Lisbon",
      "x-mangora-geo-locale": "pt-PT",
      "x-mangora-geo-currency": "EUR",
    });
    expect(geoHeaders(geoLocation({ country: "DE" }))).toEqual({ "x-mangora-geo-country": "DE" });
    expect(geoHeaders(geoLocation({}))).toEqual({});
  });
});

describe("resolveLocale com país detectado", () => {
  it("escolha explícita (preferência, caminho ou cookie) sempre vence o país", () => {
    expect(resolveLocale({ preference: "en-US", countryLocale: "pt-PT" })).toBe("en-US");
    expect(resolveLocale({ path: "es-ES", countryLocale: "pt-PT" })).toBe("es-ES");
    expect(resolveLocale({ cookie: "pt-PT", countryLocale: "en-US" })).toBe("pt-PT");
  });

  it("idioma do navegador vence o país detectado", () => {
    expect(resolveLocale({ acceptLanguage: "en-GB,en;q=0.9", countryLocale: "pt-PT" })).toBe("en-US");
    expect(resolveLocale({ acceptLanguage: "es-MX", countryLocale: "en-US" })).toBe("es-ES");
  });

  it("sem navegador conhecido, o país define o idioma", () => {
    expect(resolveLocale({ acceptLanguage: "de-DE,de;q=0.9", countryLocale: "pt-PT" })).toBe("pt-PT");
    expect(resolveLocale({ countryLocale: "en-US" })).toBe("en-US");
  });

  it("sem nenhum sinal cai no pt-BR", () => {
    expect(resolveLocale({})).toBe("pt-BR");
    expect(resolveLocale({ acceptLanguage: "ja-JP", countryLocale: null })).toBe("pt-BR");
  });

  it("país detectado sem idioma mapeado não interfere", () => {
    const geo = geoLocation({ country: "DE" });
    expect(resolveLocale({ acceptLanguage: "ja-JP", countryLocale: geo.locale })).toBe("pt-BR");
  });
});

describe("suggestedLocale", () => {
  it("aceita país ou idioma livre", () => {
    expect(suggestedLocale("PT")).toBe("pt-PT");
    expect(suggestedLocale("en-GB")).toBe("en-US");
  });
});
