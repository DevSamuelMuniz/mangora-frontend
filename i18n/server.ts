import { cookies, headers } from "next/headers";

import { LOCALE_COOKIE, resolveLocale, type Locale } from "./config";
import { createTranslator, fallbackChain, mergeMessages, type Messages } from "./runtime";

const NAMESPACES = ["common", "navigation", "validations", "statuses", "paymentMethods", "errors"] as const;
type Namespace = (typeof NAMESPACES)[number];

const localeLoaders: Record<Locale, Record<Namespace, () => Promise<{ default: Messages }>>> = {
  "pt-BR": {
    common: () => import("../messages/pt-BR/common.json") as Promise<{ default: Messages }>,
    navigation: () => import("../messages/pt-BR/navigation.json") as Promise<{ default: Messages }>,
    validations: () => import("../messages/pt-BR/validations.json") as Promise<{ default: Messages }>,
    statuses: () => import("../messages/pt-BR/statuses.json") as Promise<{ default: Messages }>,
    paymentMethods: () => import("../messages/pt-BR/paymentMethods.json") as Promise<{ default: Messages }>,
    errors: () => import("../messages/pt-BR/errors.json") as Promise<{ default: Messages }>,
  },
  "en-US": {
    common: () => import("../messages/en-US/common.json") as Promise<{ default: Messages }>,
    navigation: () => import("../messages/en-US/navigation.json") as Promise<{ default: Messages }>,
    validations: () => import("../messages/en-US/validations.json") as Promise<{ default: Messages }>,
    statuses: () => import("../messages/en-US/statuses.json") as Promise<{ default: Messages }>,
    paymentMethods: () => import("../messages/en-US/paymentMethods.json") as Promise<{ default: Messages }>,
    errors: () => import("../messages/en-US/errors.json") as Promise<{ default: Messages }>,
  },
  "es-ES": {
    common: () => import("../messages/es-ES/common.json") as Promise<{ default: Messages }>,
    navigation: () => import("../messages/es-ES/navigation.json") as Promise<{ default: Messages }>,
    validations: () => import("../messages/es-ES/validations.json") as Promise<{ default: Messages }>,
    statuses: () => import("../messages/es-ES/statuses.json") as Promise<{ default: Messages }>,
    paymentMethods: () => import("../messages/es-ES/paymentMethods.json") as Promise<{ default: Messages }>,
    errors: () => import("../messages/es-ES/errors.json") as Promise<{ default: Messages }>,
  },
  "pt-PT": {
    common: () => import("../messages/pt-PT/common.json") as Promise<{ default: Messages }>,
    navigation: () => import("../messages/pt-PT/navigation.json") as Promise<{ default: Messages }>,
    validations: () => import("../messages/pt-PT/validations.json") as Promise<{ default: Messages }>,
    statuses: () => import("../messages/pt-PT/statuses.json") as Promise<{ default: Messages }>,
    paymentMethods: () => import("../messages/pt-PT/paymentMethods.json") as Promise<{ default: Messages }>,
    errors: () => import("../messages/pt-PT/errors.json") as Promise<{ default: Messages }>,
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

/** Locale do usuário: cookie → Accept-Language → fallback pt-BR. */
export async function getLocale(): Promise<Locale> {
  const [cookieStore, headerStore] = await Promise.all([cookies(), headers()]);
  return resolveLocale({
    cookie: cookieStore.get(LOCALE_COOKIE)?.value ?? null,
    acceptLanguage: headerStore.get("accept-language"),
  });
}

export async function getTranslator() {
  const locale = await getLocale();
  return { locale, t: createTranslator(await loadMessages(locale)) };
}
