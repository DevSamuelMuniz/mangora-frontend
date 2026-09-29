import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiRequest } from "@/lib/api/client";
import type { PaymentMethod } from "@/types/sale";
import type { Order, OrderStatus } from "@/types/order";
import { financialQueryKey } from "@/features/financial/hooks/useFinancialEntries";
import { salesQueryKey } from "@/features/sales/hooks/useSales";
import { stockQueryKey } from "@/features/stock/hooks/useStockOverview";

/**
 * Domínio de pedidos — hooks de estado de servidor.
 * Fase 5: listar, atualizar status, cancelar (libera reserva) e converter
 * em venda (com invalidação cruzada — venda gerada reflete em tudo).
 */

export const ordersQueryKey = ["orders"] as const;

export function useOrders() {
    return useQuery<Order[], Error>({
        queryKey: ordersQueryKey,
        queryFn: () => apiRequest<Order[]>("/orders"),
    });
}

export function useCreateOrder() {
    const queryClient = useQueryClient();
    return useMutation<Order, Error, Record<string, unknown>>({
        mutationFn: (payload) => apiRequest<Order>("/orders", { method: "POST", body: JSON.stringify(payload) }),
        onSuccess: () => {
            // Pedido reserva estoque: invalida pedidos e estoque.
            void Promise.all([
                queryClient.invalidateQueries({ queryKey: ordersQueryKey }),
                queryClient.invalidateQueries({ queryKey: stockQueryKey }),
            ]);
        },
    });
}

export function useOrderStatus() {
    const queryClient = useQueryClient();
    return useMutation<Order, Error, { id: string; status: OrderStatus }>({
        mutationFn: ({ id, status }) =>
            apiRequest<Order>(`/orders/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ordersQueryKey });
        },
    });
}

export function useCancelOrder() {
    const queryClient = useQueryClient();
    return useMutation<Order, Error, { id: string; reason: string }>({
        mutationFn: ({ id, reason }) =>
            apiRequest<Order>(`/orders/${id}/cancel`, { method: "POST", body: JSON.stringify({ reason }) }),
        onSuccess: () => {
            // Cancelamento libera a reserva de estoque.
            void Promise.all([
                queryClient.invalidateQueries({ queryKey: ordersQueryKey }),
                queryClient.invalidateQueries({ queryKey: stockQueryKey }),
            ]);
        },
    });
}

export function useConvertOrder() {
    const queryClient = useQueryClient();
    return useMutation<Order, Error, { id: string; paymentMethod: PaymentMethod }>({
        mutationFn: ({ id, paymentMethod }) =>
            apiRequest<Order>(`/orders/${id}/convert`, { method: "POST", body: JSON.stringify({ paymentMethod }) }),
        onSuccess: () => {
            // Converter pedido cria uma venda: invalida vendas, estoque e financeiro.
            void Promise.all([
                queryClient.invalidateQueries({ queryKey: ordersQueryKey }),
                queryClient.invalidateQueries({ queryKey: salesQueryKey }),
                queryClient.invalidateQueries({ queryKey: stockQueryKey }),
                queryClient.invalidateQueries({ queryKey: financialQueryKey }),
                queryClient.invalidateQueries({ queryKey: ["analytics"] }),
            ]);
        },
    });
}
