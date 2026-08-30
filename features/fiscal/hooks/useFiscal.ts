import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiRequest } from "@/lib/api/client";
import type { FiscalDocument, FiscalDocumentType, FiscalReadiness, FiscalSettingsResponse } from "@/types/fiscal";
import type { Sale } from "@/types/sale";

/**
 * Domínio fiscal — hooks de estado de servidor.
 * Fase 5: central de documentos (visão, preparação e ações da SEFAZ/provedor)
 * e configuração fiscal por unidade.
 */

export const fiscalQueryKey = ["fiscal-overview"] as const;
export const fiscalSettingsQueryKey = ["fiscal-settings"] as const;

export type FiscalOverview = {
    documents: FiscalDocument[];
    sales: Sale[];
    readiness: FiscalReadiness | null;
};

export function useFiscalOverview() {
    return useQuery<FiscalOverview, Error>({
        queryKey: fiscalQueryKey,
        queryFn: async () => {
            const [documents, sales, readiness] = await Promise.all([
                apiRequest<FiscalDocument[]>("/fiscal/documents"),
                apiRequest<Sale[]>("/sales"),
                apiRequest<FiscalReadiness>("/fiscal/readiness"),
            ]);
            return { documents, sales, readiness };
        },
    });
}

export function usePrepareDocument() {
    const queryClient = useQueryClient();
    return useMutation<FiscalDocument, Error, { saleId: string; type: FiscalDocumentType }>({
        mutationFn: ({ saleId, type }) =>
            apiRequest<FiscalDocument>("/fiscal/documents/prepare", { method: "POST", body: JSON.stringify({ saleId, type }) }),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: fiscalQueryKey });
        },
    });
}

export function useFiscalAction() {
    const queryClient = useQueryClient();
    return useMutation<FiscalDocument, Error, { id: string; action: "issue" | "consult" | "cancel"; reason?: string }>({
        mutationFn: ({ id, action, reason }) =>
            apiRequest<FiscalDocument>(`/fiscal/documents/${id}/${action}`, {
                method: "POST",
                body: reason ? JSON.stringify({ reason }) : undefined,
            }),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: fiscalQueryKey });
        },
    });
}

export type FiscalSettingsOverview = {
    data: FiscalSettingsResponse;
    readiness: FiscalReadiness | null;
};

export function useFiscalSettings() {
    return useQuery<FiscalSettingsOverview, Error>({
        queryKey: fiscalSettingsQueryKey,
        queryFn: async () => {
            const [settings, readiness] = await Promise.all([
                apiRequest<FiscalSettingsResponse>("/fiscal/settings"),
                apiRequest<FiscalReadiness>("/fiscal/readiness"),
            ]);
            return { data: settings, readiness };
        },
    });
}

export function useSaveFiscalSettings() {
    const queryClient = useQueryClient();
    return useMutation<FiscalSettingsResponse, Error, Record<string, unknown>>({
        mutationFn: (payload) => apiRequest<FiscalSettingsResponse>("/fiscal/settings", { method: "PATCH", body: JSON.stringify(payload) }),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: fiscalSettingsQueryKey });
        },
    });
}

export function useConnectFiscalProvider() {
    const queryClient = useQueryClient();
    return useMutation<FiscalSettingsResponse, Error, { token: string }>({
        mutationFn: ({ token }) =>
            apiRequest<FiscalSettingsResponse>("/fiscal/provider/connect", { method: "POST", body: JSON.stringify({ token }) }),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: fiscalSettingsQueryKey });
        },
    });
}
