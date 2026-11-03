// @vitest-environment node
import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import sitemap from "@/app/sitemap";
import { publicMetadata, landingFaq } from "@/lib/seo";
import { buildBrandGraph } from "@/lib/brand";
import { proxy } from "@/proxy";

describe("public SEO", () => {
  it("lists unique localized URLs with reciprocal alternates and no invented dates", () => {
    const entries = sitemap();
    expect(entries).toHaveLength(37);
    expect(new Set(entries.map(entry => entry.url)).size).toBe(37);
    for (const entry of entries) {
      if (entry.alternates) expect(Object.values(entry.alternates.languages!)).toContain(entry.url);
      expect(entry.lastModified).toBeUndefined();
    }
  });
  it("uses the page's canonical URL and sharing content", () => {
    const metadata = publicMetadata("/sobre", "en-US", "About", "About the platform");
    expect(metadata.alternates?.canonical).toBe("https://www.mangora.com.br/en/sobre");
    expect(metadata.openGraph).toMatchObject({ url: "https://www.mangora.com.br/en/sobre", description: "About the platform", locale: "en_US" });
    expect(metadata.twitter).toMatchObject({ card: "summary_large_image", title: "About | Mangora" });
  });
  it("builds FAQ schema from the same translated content as the page", () => {
    const faq = landingFaq(key => `translated:${key}`);
    const graph = buildBrandGraph("es-ES", "Descripción", faq);
    const page = graph["@graph"].find(node => "mainEntity" in node)!;
    expect(page).toMatchObject({ url: "https://www.mangora.com.br/es", inLanguage: "es-ES", mainEntity: faq.map(item => ({ "@type": "Question", name: item.question, acceptedAnswer: { "@type": "Answer", text: item.answer } })) });
  });
  it("keeps public language stable despite cookies and forged locale headers", () => {
    const response = proxy(new NextRequest("https://www.mangora.com.br/", { headers: { cookie: "mangora_locale=en-US", "x-mangora-public-locale": "es-ES" } }));
    expect(response.headers.get("x-middleware-request-x-mangora-public-locale")).toBe("pt-BR");
    expect(response.headers.get("X-Robots-Tag")).toBeNull();
    const localized = proxy(new NextRequest("https://www.mangora.com.br/en/sobre"));
    expect(localized.headers.get("x-middleware-request-x-mangora-public-locale")).toBe("en-US");
  });
  it("prevents private pages from being indexed", () => {
    expect(proxy(new NextRequest("https://www.mangora.com.br/en/vendas")).headers.get("X-Robots-Tag")).toBe("noindex, nofollow");
  });
});

it("canonicalizes Portuguese-only guides without false translated editions", async () => {
  const { guides, guidePaths, findGuide } = await import("@/lib/guides");
  const { guideMetadata } = await import("@/lib/seo");
  expect(guidePaths).toHaveLength(5);
  expect(new Set(guides.map(guide => guide.slug)).size).toBe(4);
  expect(findGuide("missing")).toBeUndefined();
  for (const guide of guides) {
    expect(guide.sections.length).toBeGreaterThanOrEqual(4);
    expect(guide.faq.length).toBeGreaterThanOrEqual(3);
    const path = `/guias/${guide.slug}`;
    expect(guideMetadata(path, guide.title, guide.description).alternates?.languages).toEqual({ "pt-BR": `https://www.mangora.com.br${path}` });
    const response = proxy(new NextRequest(`https://www.mangora.com.br/en${path}?ref=test`));
    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe(`https://www.mangora.com.br${path}?ref=test`);
    expect(proxy(new NextRequest(`https://www.mangora.com.br${path}`)).headers.get("X-Robots-Tag")).toBeNull();
  }
});
