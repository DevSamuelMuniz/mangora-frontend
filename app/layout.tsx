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
    default: "Mangora | Gestão inteligente para o seu negócio",
    template: "%s | Mangora",
  },
  description:
    "Conheça a Mangora: vendas, estoque, clientes e financeiro trabalhando juntos. Comece com 7 dias grátis, sem cartão.",
  applicationName: "Mangora",
  keywords: ["gestão empresarial", "sistema de vendas", "controle de estoque", "PDV", "financeiro", "Mangora"],
  authors: [{ name: "Mangora", url: "https://www.mangora.com.br" }],
  creator: "Mangora",
  publisher: "Mangora",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "/",
    siteName: "Mangora",
    title: "Conheça a Mangora — seu negócio flui, você respira",
    description: "Vendas, estoque, clientes e financeiro em um só lugar. Conheça o sistema e teste gratuitamente por 7 dias, sem cartão.",
    images: [{ url: "/mangora-share.png", width: 500, height: 500, alt: "Mascote da Mangora trabalhando no computador" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Conheça a Mangora — gestão que acompanha seu negócio",
    description: "Organize vendas, estoque, clientes e financeiro. Teste a Mangora gratuitamente por 7 dias.",
    images: ["/mangora-share.png"],
  },
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
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
        <QueryProvider>
          <ToastProvider>{children}</ToastProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
