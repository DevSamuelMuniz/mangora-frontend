import type { Locale } from "@/i18n/config";
import { localePath } from "@/i18n/urls";

export const brand = {
  name: "Mangora",
  url: "https://www.mangora.com.br",
  title: "Mangora | Sistema de gestão, vendas e estoque",
  description: "Conheça a Mangora: vendas, estoque, clientes, caixa e financeiro em um só sistema de gestão online. Experimente por 7 dias grátis, sem cartão.",
  image: "/mangora-whatsapp.png",
};

export function buildBrandGraph(locale: Locale, description: string, faq: { question: string; answer: string }[] = []) {
const pageUrl = new URL(localePath("/", locale), brand.url).href;
return {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${brand.url}/#organization`,
      name: brand.name,
      url: brand.url,
      logo: { "@type": "ImageObject", url: `${brand.url}${brand.image}`, width: 500, height: 500 },
      description,
    },
    {
      "@type": "WebSite",
      "@id": `${brand.url}/#website`,
      name: brand.name,
      alternateName: ["Sistema Mangora", "mangora.com.br"],
      url: `${brand.url}/`,
      inLanguage: locale,
      publisher: { "@id": `${brand.url}/#organization` },
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${brand.url}/#software`,
      name: brand.name,
      url: pageUrl,
      inLanguage: locale,
      image: `${brand.url}${brand.image}`,
      description,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      publisher: { "@id": `${brand.url}/#organization` },
    },
    {
      "@type": faq.length ? ["WebPage", "FAQPage"] : "WebPage",
      "@id": `${pageUrl}#webpage`, url: pageUrl, inLanguage: locale,
      name: brand.name, description,
      isPartOf: { "@id": `${brand.url}/#website` },
      about: { "@id": `${brand.url}/#software` },
      ...(faq.length ? { mainEntity: faq.map(item => ({ "@type": "Question", name: item.question, acceptedAnswer: { "@type": "Answer", text: item.answer } })) } : {}),
    },
  ],
};
}
export const brandGraph = buildBrandGraph("pt-BR", brand.description);
