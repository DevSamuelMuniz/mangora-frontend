import React from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import I18nProvider from "@/i18n/provider";
import billing from "@/messages/pt-BR/billing.json";
import common from "@/messages/pt-BR/common.json";
import systemAdmin from "@/messages/pt-BR/system-admin.json";
import SubscriptionManagement from "@/components/subscription/SubscriptionManagement";
import SubscriptionPayments from "@/components/subscription/SubscriptionPayments";
import PaymentsPanel, { type SystemPayment } from "@/components/system-admin/PaymentsPanel";
import { invoice } from "./fixtures.mjs";
import "../../app/globals.css";
import "./preview.css";
const payment: SystemPayment = { ...invoice, rawStatus: invoice.status, createdAt: invoice.dueDate, paymentProvider: "ASAAS" };
const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
createRoot(document.getElementById("root")!).render(<QueryClientProvider client={client}><I18nProvider locale="pt-BR" messages={{ billing, common, systemAdmin }}><main style={{ maxWidth: 1440, margin: "0 auto", padding: 24 }}>
{window.location.pathname === "/admin" ? <PaymentsPanel items={[payment]} status="" onStatus={() => {}} onReconcile={async () => ({ items: [payment], checked: 1, updated: 0, failed: 0, providerConfigured: true })} onReload={() => {}} onCancel={async () => "CANCELLED"} /> : window.location.pathname.includes("/cobrancas") ? <SubscriptionPayments /> : <SubscriptionManagement />}
</main></I18nProvider></QueryClientProvider>);
