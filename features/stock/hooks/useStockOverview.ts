import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiRequest } from "@/lib/api/client";
import type { StockMovement, StockOverviewResponse } from "@/types/stock";

/**
 * Domínio de estoque — hooks de estado de servidor.
 *
 * Fase 3/5: visão consolidada, movimentação manual e transferência entre
 * lojas, com invalidação automática do estoque.
 * (A chave também é usada pela Fase 4 para invalidar o estoque após vendas.)
 */

export const stockQueryKey = ["stock"] as const;

export function useStockOverview() {
    return useQuery<StockOverviewResponse, Error>({
        queryKey: stockQueryKey,
        queryFn: () => apiRequest<StockOverviewResponse>("/stock"),
    });
}

export function useCreateStockMovement() {
    const queryClient = useQueryClient();
    return useMutation<StockMovement, Error, Record<string, unknown>>({
        mutationFn: (payload) =>
            apiRequest<StockMovement>("/stock/movements", { method: "POST", body: JSON.stringify(payload) }),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: stockQueryKey });
        },
    });
}

export function useCreateStockTransfer() {
    const queryClient = useQueryClient();
    return useMutation<unknown, Error, Record<string, unknown>>({
        mutationFn: (payload) =>
            apiRequest("/stock/transfers", { method: "POST", body: JSON.stringify(payload) }),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: stockQueryKey });
        },
    });
}
