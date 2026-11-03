# SEO e GEO

As páginas públicas têm canonical próprio, títulos e descrições traduzidos, Open Graph e Twitter Cards. O sitemap lista as oito páginas institucionais nos quatro idiomas, com alternates recíprocos e x-default. Datas de alteração só devem ser adicionadas quando houver uma data editorial real.

O idioma público é determinado pela URL: português brasileiro na raiz, inglês em /en, espanhol em /es e português europeu em /pt. Cookies e preferências da conta continuam válidos na aplicação, mas não alteram o conteúdo de uma URL pública. O seletor de idioma navega para a URL correspondente.

A página inicial publica Organization, WebSite, SoftwareApplication e FAQPage em JSON-LD. As perguntas e respostas usam exatamente os dados traduzidos exibidos na página. Não há avaliações, preços ou dados comerciais inventados. As lojas públicas têm canonical próprio; páginas operacionais e de autenticação recebem noindex e ficam fora do sitemap. Robots não substitui autenticação.

GEO significa facilitar a compreensão do conteúdo por mecanismos com IA: texto público acessível, entidades identificáveis, perguntas claras e dados estruturados consistentes. Não garante citações ou posições e não exige arquivos especiais como llms.txt.

Após publicar, enviar /sitemap.xml no Google Search Console e Bing Webmaster Tools, inspecionar as URLs públicas e validar o JSON-LD no Schema Markup Validator. A imagem de compartilhamento é gerada em /opengraph-image (1200 × 630).

Referências oficiais: [Google: otimização para experiências com IA](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide), [versões localizadas](https://developers.google.com/search/docs/specialty/international/localized-versions).

## Guias públicos

A central /guias reúne quatro artigos próprios em português brasileiro sobre estoque, PDV, fluxo de caixa e etiquetas. O conteúdo usa um catálogo tipado em lib/guides.ts, compartilhado pela listagem, páginas, FAQ e sitemap. Cada artigo tem título e descrição próprios, breadcrumb, sumário, leituras relacionadas e links para referências quando aplicáveis. Prefixos de outros idiomas redirecionam para a edição real em português; não publicar hreflang de traduções inexistentes. O sitemap passa a ter 37 URLs. Nenhuma data de publicação ou revisão é inventada.
