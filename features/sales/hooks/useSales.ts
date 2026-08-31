import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiRequest } from "@/lib/api/client";
import { useApiQuery } from "@/lib/hooks/useApiQuery";
import type { PaymentMethod, Sale } from "@/types/sale";
import type { Customer } from "@/types/customer";
import type { Product } from "@/types/product";
import { customersQueryKey } from "@/features/customers/hooks/useCustomers";
import { financialQueryKey } from "@/features/financial/hooks/useFinancialEntries";
import { productsQueryKey } from "@/features/products/hooks/useProducts";
import { stockQueryKey } from "@/features/stock/hooks/useStockOverview";
import { cashRegisterQueryKey } from "@/features/cash-registers/hooks/useCashRegister";

/**
 * Domínio de vendas — hooks de estado de servidor.
 *
 * Fase 3/4: fonte única para carregar/criar/cancelar vendas. A criação de
 * venda invalida todos os caches afetados (vendas, estoque, analytics,
 * clientes, financeiro) — uma venda criada no PDV reflete em todas as telas.
 */

export const salesQueryKey = ["sales"] as const;

export function useSales() {
    return useApiQuery<Sale[]>(salesQueryKey, "/sales");
}

/** Opções do formulário de venda: catálogo de produtos e clientes. */
export function useSaleOptions() {
    return useQuery<{ products: Product[]; customers: Customer[] }, Error>({
        queryKey: ["sale-options"],
        queryFn: async () => {
            const [products, customers] = await Promise.all([
                apiRequest<Product[]>("/products"),
                apiRequest<Customer[]>("/customers"),
            ]);
            return { products, customers };
        },
    });
}

export type CreateSaleInput = {
    customerId?: string;
    customerDocument?: string;
    paymentMethod: PaymentMethod;
    dueDate?: string;
    discount: number;
    items: { productId: string; quantity: number }[];
};

export function useCreateSale() {
    const queryClient = useQueryClient();
    return useMutation<Sale, Error, CreateSaleInput>({
        mutationFn: (input) => apiRequest<Sale>("/sales", { method: "POST", body: JSON.stringify(input) }),
        onSuccess: () => {
            // Fase 4: invalidação cruzada — estoque, analytics, clientes e
            // financeiro refletem a venda sem depender de refresh manual.
            void Promise.all([
                queryClient.invalidateQueries({ queryKey: salesQueryKey }),
                queryClient.invalidateQueries({ queryKey: productsQueryKey }),
                queryClient.invalidateQueries({ queryKey: stockQueryKey }),
                queryClient.invalidateQueries({ queryKey: customersQueryKey }),
                queryClient.invalidateQueries({ queryKey: financialQueryKey }),
                queryClient.invalidateQueries({ queryKey: ["analytics"] }),
            ]);
        },
    });
}

export function useCancelSale() {
    const queryClient = useQueryClient();
    return useMutation<Sale, Error, { id: string; reason: string }>({
        mutationFn: ({ id, reason }) =>
            apiRequest<Sale>(`/sales/${id}/cancel`, {
                method: "POST",
                body: JSON.stringify({ reason }),
            }),
        onSuccess: () => {
            // Cancelamento estorna estoque, financeiro, caixa, cliente e analytics.
            void Promise.all([
                queryClient.invalidateQueries({ queryKey: salesQueryKey }),
                queryClient.invalidateQueries({ queryKey: productsQueryKey }),
                queryClient.invalidateQueries({ queryKey: stockQueryKey }),
                queryClient.invalidateQueries({ queryKey: customersQueryKey }),
                queryClient.invalidateQueries({ queryKey: financialQueryKey }),
                queryClient.invalidateQueries({ queryKey: cashRegisterQueryKey }),
                queryClient.invalidateQueries({ queryKey: ["analytics"] }),
            ]);
        },
    });
}
