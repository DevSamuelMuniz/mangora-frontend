import { useQuery } from "@tanstack/react-query";

import { apiRequest } from "@/lib/api/client";
import type { ReportDataset, ReportPeriod } from "@/types/report";

/**
 * Domínio de relatórios — hook de estado de servidor.
 * Fase 5: fonte única para o relatório consolidado por período.
 * A troca de período muda a queryKey e o TanStack refaz a busca
 * automaticamente (com cache por período).
 */

export const reportsQueryKey = (period: ReportPeriod) => ["analytics-reports", period] as const;

export function useReports(period: ReportPeriod) {
    return useQuery<ReportDataset, Error>({
        queryKey: reportsQueryKey(period),
        queryFn: () => apiRequest<ReportDataset>(`/analytics/reports?period=${period}`),
    });
}
