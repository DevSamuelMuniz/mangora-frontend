import type { MetadataRoute } from "next";

/** Manifesto PWA — permite instalar o Mangora como aplicativo. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Mangora | Gestão inteligente",
    short_name: "Mangora",
    description: "Vendas, estoque, clientes e financeiro da sua empresa.",
    id: "/dashboard",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#123d2b",
    theme_color: "#123d2b",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
