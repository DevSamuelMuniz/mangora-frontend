import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiRequest } from "@/lib/api/client";
import { useApiQuery } from "@/lib/hooks/useApiQuery";
import type { Customer } from "@/types/customer";

export type CustomerMonthlyPurchases = {
    month: string; total: number; count: number;
    sales: Array<{ id: string; number: number; code: string; createdAt: string; total: number; paymentMethod: string; items: Array<{ productName: string; quantity: number; unitPrice: number; subtotal: number }>; payments: Array<{ method: string; amount: number }> }>;
};

/**
 * Domínio de clientes — hooks de estado de servidor.
 *
 * Fase 3: fonte única para listar/excluir clientes.
 */

export const customersQueryKey = ["customers"] as const;
/** Query do PDV que carrega clientes junto com o catálogo (dropdown da Etapa 3). */
export const saleOptionsQueryKey = ["sale-options"] as const;

export function useCustomers() {
    return useApiQuery<Customer[]>(customersQueryKey, "/customers");
}

export function useDeleteCustomer() {
    const queryClient = useQueryClient();
    return useMutation<void, Error, { id: string }>({
        mutationFn: ({ id }) => apiRequest<void>(`/customers/${id}`, { method: "DELETE" }),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: customersQueryKey });
            void queryClient.invalidateQueries({ queryKey: saleOptionsQueryKey });
        },
    });
}

/** Dados do formulário de cliente: entidade em edição (ou null para novo). */
export function useCustomerForm(customerId: string | null) {
    return useQuery<Customer | null, Error>({
        queryKey: ["customer-form", customerId ?? "new"],
        queryFn: () => (customerId ? apiRequest<Customer>(`/customers/${customerId}`) : Promise.resolve(null)),
        enabled: Boolean(customerId),
    });
}

export function useCustomerPurchases(customerId: string, month: string) {
    return useQuery<CustomerMonthlyPurchases, Error>({
        queryKey: ["customer-purchases", customerId, month],
        queryFn: () => apiRequest<CustomerMonthlyPurchases>(`/customers/${customerId}/purchases?month=${month}`),
        enabled: Boolean(customerId && month),
    });
}

export function useSaveCustomer() {
    const queryClient = useQueryClient();
    return useMutation<Customer, Error, { id?: string | null; payload: Record<string, unknown> }>({
        mutationFn: ({ id, payload }) =>
            apiRequest<Customer>(id ? `/customers/${id}` : "/customers", {
                method: id ? "PATCH" : "POST",
                body: JSON.stringify(payload),
            }),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: customersQueryKey });
            void queryClient.invalidateQueries({ queryKey: saleOptionsQueryKey });
        },
    });
}
