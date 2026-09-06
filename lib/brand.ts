export const brand = {
  name: "Mangora",
  url: "https://www.mangora.com.br",
  title: "Mangora | Sistema de gestão, vendas e estoque",
  description: "Conheça a Mangora: vendas, estoque, clientes, caixa e financeiro em um só sistema de gestão online. Experimente por 7 dias grátis, sem cartão.",
  image: "/mangora-share.png",
};

export const brandGraph = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${brand.url}/#organization`,
      name: brand.name,
      url: brand.url,
      logo: { "@type": "ImageObject", url: `${brand.url}${brand.image}`, width: 500, height: 500 },
      description: brand.description,
    },
    {
      "@type": "WebSite",
      "@id": `${brand.url}/#website`,
      name: brand.name,
      alternateName: ["Sistema Mangora", "mangora.com.br"],
      url: `${brand.url}/`,
      inLanguage: "pt-BR",
      publisher: { "@id": `${brand.url}/#organization` },
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${brand.url}/#software`,
      name: brand.name,
      url: brand.url,
      image: `${brand.url}${brand.image}`,
      description: brand.description,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      publisher: { "@id": `${brand.url}/#organization` },
    },
  ],
};
