import { useMutation } from "@tanstack/react-query";

import { apiRequest } from "@/lib/api/client";

export type ImportKind = "products" | "customers" | "suppliers";

export type ImportResult = { imported: number; skipped: number; errors: string[] };

export function useImportCsv(kind: ImportKind) {
  return useMutation<ImportResult, Error, string>({
    mutationFn: (content) =>
      apiRequest<ImportResult>(`/data-transfer/${kind}/import`, { method: "POST", body: JSON.stringify({ content }) }),
  });
}

/** Baixa o CSV de exportação usando a mesma origem do proxy (cookie de sessão). */
export async function downloadCsv(kind: ImportKind) {
  const response = await fetch(`/api/backend/data-transfer/${kind}.csv`, { credentials: "include" });
  if (!response.ok) {
    const message = await response.text().catch(() => "");
    throw new Error(message || "Não foi possível baixar o arquivo.");
  }
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${kind}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
