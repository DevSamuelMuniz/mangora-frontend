import type { Messages } from "./runtime";

/**
 * Lê uma lista de strings traduzidas de um catálogo (ex.: itens das páginas
 * informativas públicas) sem depender do locale ativo.
 */
export function translatedItems(messages: Messages, key: string): string[] {
  const segments = key.split(".");
  let current: unknown = messages;
  for (const segment of segments) {
    if (typeof current !== "object" || current === null) return [];
    current = (current as Record<string, unknown>)[segment];
  }
  return Array.isArray(current) ? current.filter((item): item is string => typeof item === "string") : [];
}
