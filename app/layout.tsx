import type { Metadata } from "next";
import {
  Bricolage_Grotesque,
  Geist,
  Geist_Mono,
  Manrope,
} from "next/font/google";
import QueryProvider from "@/components/providers/QueryProvider";
import { ToastProvider } from "@/components/ui/toast";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.mangora.com.br"),
  title: {
    default: "Mangora — Gestão simples para vender, organizar e crescer",
    template: "%s | Mangora",
  },
  description:
    "Conheça a Mangora: um sistema simples para cuidar de vendas, estoque, clientes, caixa e financeiro. Comece com 7 dias grátis, sem cartão.",
  applicationName: "Mangora",
  keywords: ["gestão empresarial", "sistema de vendas", "controle de estoque", "PDV", "financeiro", "Mangora"],
  authors: [{ name: "Mangora", url: "https://www.mangora.com.br" }],
  creator: "Mangora",
  publisher: "Mangora",
  category: "Gestão empresarial",
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Mangora",
    title: "Mangora — Gestão simples para o seu negócio",
    description: "Vendas, estoque, clientes, caixa e financeiro em um só lugar. Conheça a Mangora e teste gratuitamente por 7 dias, sem cartão.",
    images: [{ url: "/mangora-share.png", width: 500, height: 500, alt: "Mascote da Mangora trabalhando no computador" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mangora — Gestão simples para o seu negócio",
    description: "Organize vendas, estoque, clientes, caixa e financeiro. Teste a Mangora gratuitamente por 7 dias.",
    images: ["/mangora-share.png"],
  },
  icons: {
    icon: [{ url: "/favicon.ico", type: "image/x-icon" }],
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} ${bricolage.variable} ${manrope.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "Mangora",
            alternateName: "Sistema Mangora",
            url: "https://www.mangora.com.br",
            image: "https://www.mangora.com.br/mangora-share.png",
            logo: "https://www.mangora.com.br/icon.png",
            description: "Sistema de gestão para vendas, estoque, clientes, caixa e financeiro.",
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web",
            offers: { "@type": "Offer", price: "0", priceCurrency: "BRL", description: "7 dias grátis e plano Free" },
          }).replace(/</g, "\\u003c") }}
        />
        <QueryProvider>
          <ToastProvider>{children}</ToastProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
