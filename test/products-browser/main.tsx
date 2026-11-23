import React from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import I18nProvider from "@/i18n/provider";
import ProductCatalog from "@/components/products/ProductCatalog";
import products from "@/messages/pt-BR/products.json";
import common from "@/messages/pt-BR/common.json";
import navigation from "@/messages/pt-BR/navigation.json";
import "../../app/globals.css";
import "../billing-browser/preview.css";

const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={client}><I18nProvider locale="pt-BR" messages={{ products, common, navigation }}>
    <main style={{ maxWidth: 1440, margin: "0 auto", padding: 24 }}><ProductCatalog /></main>
  </I18nProvider></QueryClientProvider>,
);
