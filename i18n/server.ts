import { cache } from "react";
import { cookies, headers } from "next/headers";

import { getCurrentSession } from "@/lib/auth/server";

import { LOCALE_COOKIE, resolveLocale, type Locale } from "./config";
import { createTranslator, fallbackChain, mergeMessages, type Messages } from "./runtime";

const NAMESPACES = ["common", "navigation", "validations", "statuses", "paymentMethods", "errors", "settings", "dashboard", "sales", "pdv", "products", "stock", "customers", "suppliers", "finance", "reports", "employees", "units", "bank", "operations", "workspace"] as const;
type Namespace = (typeof NAMESPACES)[number];

const localeLoaders: Record<Locale, Record<Namespace, () => Promise<{ default: Messages }>>> = {
  "pt-BR": {
    common: () => import("../messages/pt-BR/common.json") as Promise<{ default: Messages }>,
    navigation: () => import("../messages/pt-BR/navigation.json") as Promise<{ default: Messages }>,
    validations: () => import("../messages/pt-BR/validations.json") as Promise<{ default: Messages }>,
    statuses: () => import("../messages/pt-BR/statuses.json") as Promise<{ default: Messages }>,
    paymentMethods: () => import("../messages/pt-BR/paymentMethods.json") as Promise<{ default: Messages }>,
    errors: () => import("../messages/pt-BR/errors.json") as Promise<{ default: Messages }>,
    settings: () => import("../messages/pt-BR/settings.json") as Promise<{ default: Messages }>,
    dashboard: () => import("../messages/pt-BR/dashboard.json") as Promise<{ default: Messages }>,
    sales: () => import("../messages/pt-BR/sales.json") as Promise<{ default: Messages }>,
    pdv: () => import("../messages/pt-BR/pdv.json") as Promise<{ default: Messages }>,
    products: () => import("../messages/pt-BR/products.json") as Promise<{ default: Messages }>,
    stock: () => import("../messages/pt-BR/stock.json") as Promise<{ default: Messages }>,
    customers: () => import("../messages/pt-BR/customers.json") as Promise<{ default: Messages }>,
    suppliers: () => import("../messages/pt-BR/suppliers.json") as Promise<{ default: Messages }>,
    finance: () => import("../messages/pt-BR/finance.json") as Promise<{ default: Messages }>,
    reports: () => import("../messages/pt-BR/reports.json") as Promise<{ default: Messages }>,
    employees: () => import("../messages/pt-BR/employees.json") as Promise<{ default: Messages }>,
    units: () => import("../messages/pt-BR/units.json") as Promise<{ default: Messages }>,
    bank: () => import("../messages/pt-BR/bank.json") as Promise<{ default: Messages }>,
    operations: () => import("../messages/pt-BR/operations.json") as Promise<{ default: Messages }>,
    workspace: () => import("../messages/pt-BR/workspace.json") as Promise<{ default: Messages }>,
  },
  "en-US": {
    common: () => import("../messages/en-US/common.json") as Promise<{ default: Messages }>,
    navigation: () => import("../messages/en-US/navigation.json") as Promise<{ default: Messages }>,
    validations: () => import("../messages/en-US/validations.json") as Promise<{ default: Messages }>,
    statuses: () => import("../messages/en-US/statuses.json") as Promise<{ default: Messages }>,
    paymentMethods: () => import("../messages/en-US/paymentMethods.json") as Promise<{ default: Messages }>,
    errors: () => import("../messages/en-US/errors.json") as Promise<{ default: Messages }>,
    settings: () => import("../messages/en-US/settings.json") as Promise<{ default: Messages }>,
    dashboard: () => import("../messages/en-US/dashboard.json") as Promise<{ default: Messages }>,
    sales: () => import("../messages/en-US/sales.json") as Promise<{ default: Messages }>,
    pdv: () => import("../messages/en-US/pdv.json") as Promise<{ default: Messages }>,
    products: () => import("../messages/en-US/products.json") as Promise<{ default: Messages }>,
    stock: () => import("../messages/en-US/stock.json") as Promise<{ default: Messages }>,
    customers: () => import("../messages/en-US/customers.json") as Promise<{ default: Messages }>,
    suppliers: () => import("../messages/en-US/suppliers.json") as Promise<{ default: Messages }>,
    finance: () => import("../messages/en-US/finance.json") as Promise<{ default: Messages }>,
    reports: () => import("../messages/en-US/reports.json") as Promise<{ default: Messages }>,
    employees: () => import("../messages/en-US/employees.json") as Promise<{ default: Messages }>,
    units: () => import("../messages/en-US/units.json") as Promise<{ default: Messages }>,
    bank: () => import("../messages/en-US/bank.json") as Promise<{ default: Messages }>,
    operations: () => import("../messages/en-US/operations.json") as Promise<{ default: Messages }>,
    workspace: () => import("../messages/en-US/workspace.json") as Promise<{ default: Messages }>,
  },
  "es-ES": {
    common: () => import("../messages/es-ES/common.json") as Promise<{ default: Messages }>,
    navigation: () => import("../messages/es-ES/navigation.json") as Promise<{ default: Messages }>,
    validations: () => import("../messages/es-ES/validations.json") as Promise<{ default: Messages }>,
    statuses: () => import("../messages/es-ES/statuses.json") as Promise<{ default: Messages }>,
    paymentMethods: () => import("../messages/es-ES/paymentMethods.json") as Promise<{ default: Messages }>,
    errors: () => import("../messages/es-ES/errors.json") as Promise<{ default: Messages }>,
    settings: () => import("../messages/es-ES/settings.json") as Promise<{ default: Messages }>,
    dashboard: () => import("../messages/es-ES/dashboard.json") as Promise<{ default: Messages }>,
    sales: () => import("../messages/es-ES/sales.json") as Promise<{ default: Messages }>,
    pdv: () => import("../messages/es-ES/pdv.json") as Promise<{ default: Messages }>,
    products: () => import("../messages/es-ES/products.json") as Promise<{ default: Messages }>,
    stock: () => import("../messages/es-ES/stock.json") as Promise<{ default: Messages }>,
    customers: () => import("../messages/es-ES/customers.json") as Promise<{ default: Messages }>,
    suppliers: () => import("../messages/es-ES/suppliers.json") as Promise<{ default: Messages }>,
    finance: () => import("../messages/es-ES/finance.json") as Promise<{ default: Messages }>,
    reports: () => import("../messages/es-ES/reports.json") as Promise<{ default: Messages }>,
    employees: () => import("../messages/es-ES/employees.json") as Promise<{ default: Messages }>,
    units: () => import("../messages/es-ES/units.json") as Promise<{ default: Messages }>,
    bank: () => import("../messages/es-ES/bank.json") as Promise<{ default: Messages }>,
    operations: () => import("../messages/es-ES/operations.json") as Promise<{ default: Messages }>,
    workspace: () => import("../messages/es-ES/workspace.json") as Promise<{ default: Messages }>,
  },
  "pt-PT": {
    common: () => import("../messages/pt-PT/common.json") as Promise<{ default: Messages }>,
    navigation: () => import("../messages/pt-PT/navigation.json") as Promise<{ default: Messages }>,
    validations: () => import("../messages/pt-PT/validations.json") as Promise<{ default: Messages }>,
    statuses: () => import("../messages/pt-PT/statuses.json") as Promise<{ default: Messages }>,
    paymentMethods: () => import("../messages/pt-PT/paymentMethods.json") as Promise<{ default: Messages }>,
    errors: () => import("../messages/pt-PT/errors.json") as Promise<{ default: Messages }>,
    settings: () => import("../messages/pt-PT/settings.json") as Promise<{ default: Messages }>,
    dashboard: () => import("../messages/pt-PT/dashboard.json") as Promise<{ default: Messages }>,
    sales: () => import("../messages/pt-PT/sales.json") as Promise<{ default: Messages }>,
    pdv: () => import("../messages/pt-PT/pdv.json") as Promise<{ default: Messages }>,
    products: () => import("../messages/pt-PT/products.json") as Promise<{ default: Messages }>,
    stock: () => import("../messages/pt-PT/stock.json") as Promise<{ default: Messages }>,
    customers: () => import("../messages/pt-PT/customers.json") as Promise<{ default: Messages }>,
    suppliers: () => import("../messages/pt-PT/suppliers.json") as Promise<{ default: Messages }>,
    finance: () => import("../messages/pt-PT/finance.json") as Promise<{ default: Messages }>,
    reports: () => import("../messages/pt-PT/reports.json") as Promise<{ default: Messages }>,
    employees: () => import("../messages/pt-PT/employees.json") as Promise<{ default: Messages }>,
    units: () => import("../messages/pt-PT/units.json") as Promise<{ default: Messages }>,
    bank: () => import("../messages/pt-PT/bank.json") as Promise<{ default: Messages }>,
    operations: () => import("../messages/pt-PT/operations.json") as Promise<{ default: Messages }>,
    workspace: () => import("../messages/pt-PT/workspace.json") as Promise<{ default: Messages }>,
  },
};

/** Carrega só os namespaces do locale atual, aplicando o fallback (pt-PT → pt-BR). */
export async function loadMessages(locale: Locale): Promise<Messages> {
  const chain = fallbackChain(locale);
  let messages: Messages = {};
  for (const item of [...chain].reverse()) {
    const loaders = localeLoaders[item];
    const layer: Messages = {};
    for (const namespace of NAMESPACES) {
      const loaded = await loaders[namespace]();
      layer[namespace] = loaded.default;
    }
    messages = mergeMessages(messages, layer);
  }
  return messages;
}

/** Sessão em cache por request (compartilhada com layouts) só quando há cookie de sessão. */
const cachedSession = cache(async () => {
  try {
    return await getCurrentSession();
  } catch {
    return null;
  }
});

/**
 * Locale do usuário: preferência salva → cookie → Accept-Language → pt-BR.
 * A preferência do perfil (independente do país/moeda) sempre vence.
 */
export async function getLocale(): Promise<Locale> {
  const [cookieStore, headerStore] = await Promise.all([cookies(), headers()]);
  const cookieLocale = cookieStore.get(LOCALE_COOKIE)?.value ?? null;
  const session = await cachedSession();
  return resolveLocale({
    preference: session?.user?.locale ?? session?.company?.locale ?? null,
    cookie: cookieLocale,
    acceptLanguage: headerStore.get("accept-language"),
  });
}

export async function getTranslator() {
  const locale = await getLocale();
  return { locale, t: createTranslator(await loadMessages(locale)) };
}
