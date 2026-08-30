import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiRequest } from "@/lib/api/client";
import type { FinancialEntry, FinancialOverview } from "@/types/financial";
import type { PaymentMethod } from "@/types/sale";

/**
 * Domínio financeiro — hooks de estado de servidor.
 *
 * Fase 3: fonte única para carregar o financeiro e registrar pagamentos.
 * A invalidação de ["financial"] no pagamento faz a tela refletir
 * automaticamente (sem reload manual).
 */

export const financialQueryKey = ["financial"] as const;

export function useFinancialOverview() {
    return useQuery<FinancialOverview, Error>({
        queryKey: financialQueryKey,
        queryFn: () => apiRequest<FinancialOverview>("/financial"),
    });
}

export type PayFinancialEntryInput = {
    amount: number;
    paymentMethod: PaymentMethod;
    paidAt: string;
    notes?: string;
};

export function useCreateFinancialEntry() {
    const queryClient = useQueryClient();
    return useMutation<FinancialEntry, Error, Record<string, unknown>>({
        mutationFn: (payload) =>
            apiRequest<FinancialEntry>("/financial", {
                method: "POST",
                body: JSON.stringify(payload),
            }),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: financialQueryKey });
        },
    });
}

export function usePayFinancialEntry() {
    const queryClient = useQueryClient();
    return useMutation<unknown, Error, { id: string; input: PayFinancialEntryInput }>({
        mutationFn: ({ id, input }) =>
            apiRequest(`/financial/${id}/pay`, {
                method: "PATCH",
                body: JSON.stringify(input),
            }),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: financialQueryKey });
        },
    });
}
