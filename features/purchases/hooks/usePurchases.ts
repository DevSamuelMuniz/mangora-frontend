import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiRequest } from "@/lib/api/client";
import type { Purchase } from "@/types/purchase";
import type { Product } from "@/types/product";
import type { Supplier } from "@/types/supplier";

/**
 * Domínio de compras — hooks de estado de servidor.
 * Fase 5: listar, receber/cancelar e criar compras.
 */

export const purchasesQueryKey = ["purchases"] as const;

export function usePurchases() {
    return useQuery<Purchase[], Error>({
        queryKey: purchasesQueryKey,
        queryFn: () => apiRequest<Purchase[]>("/purchases"),
    });
}

/** Opções do formulário de compra: fornecedores ativos e produtos com estoque controlado. */
export function usePurchaseForm() {
    return useQuery<{ suppliers: Supplier[]; products: Product[] }, Error>({
        queryKey: ["purchase-form"],
        queryFn: async () => {
            const [suppliers, products] = await Promise.all([
                apiRequest<Supplier[]>("/suppliers"),
                apiRequest<Product[]>("/products"),
            ]);
            return {
                suppliers: suppliers.filter((item) => item.active),
                products: products.filter((item) => item.active && item.trackStock),
            };
        },
    });
}

export function useCreatePurchase() {
    const queryClient = useQueryClient();
    return useMutation<{ id: string }, Error, Record<string, unknown>>({
        mutationFn: (payload) => apiRequest<{ id: string }>("/purchases", { method: "POST", body: JSON.stringify(payload) }),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: purchasesQueryKey });
        },
    });
}

export function usePurchaseAction() {
    const queryClient = useQueryClient();
    return useMutation<Purchase, Error, { id: string; type: "receive" | "cancel"; reason?: string }>({
        mutationFn: ({ id, type, reason }) =>
            apiRequest<Purchase>(`/purchases/${id}/${type}`, {
                method: "POST",
                body: type === "cancel" ? JSON.stringify({ reason }) : undefined,
            }),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: purchasesQueryKey });
        },
    });
}
