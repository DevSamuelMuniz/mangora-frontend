/**
 * Analytics GA4 — eventos e propriedades de usuário (sem PII: nada de
 * e-mail, nome ou telefone; apenas categorias, papel e valores).
 */

export const GA_ID = "G-D2T56HSMLK";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/** Dispara um evento GA4 (no-op seguro fora do navegador/sem gtag). */
export function track(event: string, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  window.gtag?.("event", event, { ...params, send_to: GA_ID });
}

/** Define propriedades de usuário (ex.: papel, plano, logado). */
export function setUserProperties(props: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  window.gtag?.("set", "user_properties", props);
}
