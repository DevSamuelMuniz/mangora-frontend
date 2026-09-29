import { describe, expect, it } from "vitest";

import { alternateLanguages, localeFromPrefix, localePath, normalizePath, splitLocalePrefix } from "@/i18n/urls";

describe("localePath", () => {
  it("mantém pt-BR na raiz e prefixa os demais idiomas", () => {
    expect(localePath("/", "pt-BR")).toBe("/");
    expect(localePath("/sobre", "pt-BR")).toBe("/sobre");
    expect(localePath("/", "en-US")).toBe("/en");
    expect(localePath("/sobre", "en-US")).toBe("/en/sobre");
    expect(localePath("/termos", "es-ES")).toBe("/es/termos");
    expect(localePath("/privacidade", "pt-PT")).toBe("/pt/privacidade");
  });

  it("normaliza caminhos sem barra inicial ou com barra final", () => {
    expect(normalizePath("sobre")).toBe("/sobre");
    expect(normalizePath("/sobre/")).toBe("/sobre");
    expect(normalizePath("/")).toBe("/");
    expect(localePath("sobre/", "en-US")).toBe("/en/sobre");
  });
});

describe("splitLocalePrefix", () => {
  it("separa idioma e caminho real", () => {
    expect(splitLocalePrefix("/en")).toEqual({ locale: "en-US", pathname: "/" });
    expect(splitLocalePrefix("/en/sobre")).toEqual({ locale: "en-US", pathname: "/sobre" });
    expect(splitLocalePrefix("/pt/suporte")).toEqual({ locale: "pt-PT", pathname: "/suporte" });
    expect(splitLocalePrefix("/es")).toEqual({ locale: "es-ES", pathname: "/" });
  });

  it("deixa rotas do app intactas", () => {
    expect(splitLocalePrefix("/dashboard")).toEqual({ locale: null, pathname: "/dashboard" });
    expect(splitLocalePrefix("/pdv")).toEqual({ locale: null, pathname: "/pdv" });
    expect(splitLocalePrefix("/estoque/transferencias")).toEqual({ locale: null, pathname: "/estoque/transferencias" });
    expect(splitLocalePrefix("/")).toEqual({ locale: null, pathname: "/" });
  });
});

describe("localeFromPrefix", () => {
  it("reconhece prefixos curtos e tags completas", () => {
    expect(localeFromPrefix("en")).toBe("en-US");
    expect(localeFromPrefix("ES")).toBe("es-ES");
    expect(localeFromPrefix("pt")).toBe("pt-PT");
    expect(localeFromPrefix("pt-BR")).toBe("pt-BR");
    expect(localeFromPrefix("de")).toBeNull();
    expect(localeFromPrefix(undefined)).toBeNull();
  });
});

describe("alternateLanguages", () => {
  it("aponta cada idioma para a sua URL com x-default no padrão", () => {
    expect(alternateLanguages("/sobre")).toEqual({
      "pt-BR": "/sobre",
      "pt-PT": "/pt/sobre",
      "en-US": "/en/sobre",
      "es-ES": "/es/sobre",
      "x-default": "/sobre",
    });
    expect(alternateLanguages("/")).toEqual({
      "pt-BR": "/",
      "pt-PT": "/pt",
      "en-US": "/en",
      "es-ES": "/es",
      "x-default": "/",
    });
  });
});
