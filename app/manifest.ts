import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Mangora — Gestão simples para o seu negócio",
    short_name: "Mangora",
    description: "Vendas, estoque, clientes, caixa e financeiro em um só lugar.",
    start_url: "/",
    display: "standalone",
    background_color: "#fff8ea",
    theme_color: "#ff6b1a",
    icons: [
      { src: "/favicon.png", sizes: "500x500", type: "image/png", purpose: "any" },
      { src: "/favicon.png", sizes: "500x500", type: "image/png", purpose: "maskable" },
    ],
  };
}
