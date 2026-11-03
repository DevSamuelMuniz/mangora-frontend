import type { MetadataRoute } from "next";
import { locales } from "@/i18n/config";
import { localePath } from "@/i18n/urls";

export default function robots(): MetadataRoute.Robots {
  const privatePaths = ["/adm/", "/dashboard", "/pdv", "/login", "/cadastro", "/recuperar-senha", "/redefinir-senha", "/seguranca-da-conta", "/configuracoes", "/configuracao", "/assinatura", "/clientes", "/produtos", "/vendas", "/financeiro", "/estoque", "/funcionarios", "/fornecedores", "/compras", "/pedidos", "/relatorios", "/unidades", "/caixa", "/notas-fiscais", "/categorias", "/servicos", "/etiquetas", "/gerente-ia", "/dados", "/logs", "/banco", "/operacoes"];
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/sobre", "/suporte", "/parceiros", "/seguranca", "/lgpd", "/termos", "/privacidade"],
      disallow: ["/api/", ...locales.flatMap(locale => privatePaths.map(path => localePath(path, locale)))],
    },
    sitemap: "https://www.mangora.com.br/sitemap.xml",
    host: "https://www.mangora.com.br",
  };
}
