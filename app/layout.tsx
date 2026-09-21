import type { Metadata } from "next";
import {
  Bricolage_Grotesque,
  Geist,
  Geist_Mono,
  Manrope,
} from "next/font/google";
import Script from "next/script";
import I18nProvider from "@/i18n/provider";
import { getLocale, getTranslator, loadMessages, getRegionalPreferences } from "@/i18n/server";
import { alternateLanguages } from "@/i18n/urls";
import QueryProvider from "@/components/providers/QueryProvider";
import { OperationPasswordProvider } from "@/components/ui/OperationPasswordProvider";
import { ToastProvider } from "@/components/ui/toast";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  preload: false,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  preload: false,
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getTranslator();
  return {
  metadataBase: new URL("https://www.mangora.com.br"),
  title: {
    default: t("site.meta.title"),
    template: "%s | Mangora",
  },
  description: t("site.meta.description"),
  alternates: { canonical: "/", languages: alternateLanguages("/") },
  applicationName: "Mangora",
  authors: [{ name: "Mangora", url: "https://www.mangora.com.br" }],
  creator: "Mangora",
  publisher: "Mangora",
  category: t("site.meta.category"),
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: locale.replace("-", "_"),
    siteName: "Mangora",
    title: t("site.meta.ogTitle"),
    description: t("site.meta.ogDescription"),
    images: [
      {
        url: "https://www.mangora.com.br/mangora-whatsapp.png",
        width: 500,
        height: 500,
        alt: t("site.meta.imageAlt"),
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: t("site.meta.ogTitle"),
    description: t("site.meta.twitterDescription"),
    images: ["https://www.mangora.com.br/mangora-whatsapp.png"],
  },
  icons: {
    icon: [{ url: "/favicon.ico", type: "image/x-icon" }],
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",
  },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await loadMessages(locale);
  const regional = await getRegionalPreferences();
  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} ${bricolage.variable} ${manrope.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />

            <Script id="gtag-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];

                function gtag(){
                  dataLayer.push(arguments);
                }

                gtag('js', new Date());
                gtag('config', '${GA_ID}');
              `}
            </Script>
          </>
        )}

        <I18nProvider locale={locale} messages={messages} {...regional}>
          <QueryProvider>
            <ToastProvider>
              <OperationPasswordProvider>{children}</OperationPasswordProvider>
            </ToastProvider>
          </QueryProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
