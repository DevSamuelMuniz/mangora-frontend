import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiRequest } from "@/lib/api/client";
import type { ConsolidatedOverview, UnitGroupResponse } from "@/types/unit";

/**
 * Domínio de unidades/lojas — hooks de estado de servidor.
 * Fase 5: grupo + visão consolidada (por período) e ações de criação/troca.
 */

export const unitGroupQueryKey = ["unit-group"] as const;
export const consolidatedQueryKey = (period: string) => ["analytics-consolidated", period] as const;

export function useUnitGroup() {
    return useQuery<UnitGroupResponse, Error>({
        queryKey: unitGroupQueryKey,
        queryFn: () => apiRequest<UnitGroupResponse>("/companies/group"),
    });
}

export function useConsolidated(period: string) {
    return useQuery<ConsolidatedOverview, Error>({
        queryKey: consolidatedQueryKey(period),
        queryFn: () => apiRequest<ConsolidatedOverview>(`/analytics/consolidated?period=${period}`),
    });
}

export function useCreateGroup() {
    const queryClient = useQueryClient();
    return useMutation<void, Error, { name: string }>({
        mutationFn: ({ name }) => apiRequest("/companies/group", { method: "POST", body: JSON.stringify({ name }) }),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: unitGroupQueryKey });
        },
    });
}

export function useCreateUnit() {
    const queryClient = useQueryClient();
    return useMutation<void, Error, { tradeName: string; legalName?: string; document?: string | null; email?: string; copyCatalog?: boolean }>({
        mutationFn: (input) => {
            // O DTO exige documento com exatamente 11 (CPF) ou 14 (CNPJ) dígitos.
            // Dígitos parciais causariam 400 — só enviamos quando completo.
            const document =
                input.document && /^\d{11}$|^\d{14}$/.test(input.document) ? input.document : null;
            const email = input.email?.trim() || undefined;
            return apiRequest("/companies/units", {
                method: "POST",
                body: JSON.stringify({ ...input, document, email }),
            });
        },
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: unitGroupQueryKey });
        },
    });
}

export function useSwitchCompany() {
    return useMutation<void, Error, { membershipId: string }>({
        mutationFn: ({ membershipId }) =>
            apiRequest("/auth/switch-company", { method: "POST", body: JSON.stringify({ membershipId }) }),
    });
}
