import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/sobre", "/suporte", "/parceiros", "/seguranca", "/lgpd", "/termos", "/privacidade", "/loja/"],
      disallow: ["/api/", "/adm/", "/dashboard", "/pdv", "/login", "/cadastro", "/recuperar-senha", "/redefinir-senha", "/configuracoes", "/assinatura", "/clientes", "/produtos", "/vendas", "/financeiro", "/estoque", "/funcionarios", "/fornecedores", "/compras", "/pedidos", "/relatorios", "/unidades", "/caixa", "/notas-fiscais", "/categorias", "/servicos", "/avaliacoes", "/loja/editar"],
    },
    sitemap: "https://www.mangora.com.br/sitemap.xml",
    host: "https://www.mangora.com.br",
  };
}
