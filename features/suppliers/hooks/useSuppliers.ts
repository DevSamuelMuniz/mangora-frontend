import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiRequest } from "@/lib/api/client";
import type { Supplier } from "@/types/supplier";

/**
 * Domínio de fornecedores — hooks de estado de servidor.
 * Fase 5: fonte única para listar/excluir fornecedores.
 */

export const suppliersQueryKey = ["suppliers"] as const;

export function useSuppliers() {
    return useQuery<Supplier[], Error>({
        queryKey: suppliersQueryKey,
        queryFn: () => apiRequest<Supplier[]>("/suppliers"),
    });
}

export function useDeleteSupplier() {
    const queryClient = useQueryClient();
    return useMutation<void, Error, { id: string }>({
        mutationFn: ({ id }) => apiRequest<void>(`/suppliers/${id}`, { method: "DELETE" }),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: suppliersQueryKey });
        },
    });
}

/** Dados do formulário de fornecedor: entidade em edição (ou null para novo). */
export function useSupplierForm(supplierId: string | null) {
    return useQuery<Supplier | null, Error>({
        queryKey: ["supplier-form", supplierId ?? "new"],
        queryFn: () => (supplierId ? apiRequest<Supplier>(`/suppliers/${supplierId}`) : Promise.resolve(null)),
        enabled: Boolean(supplierId),
    });
}

export function useSaveSupplier() {
    const queryClient = useQueryClient();
    return useMutation<unknown, Error, { id?: string | null; payload: Record<string, unknown> }>({
        mutationFn: ({ id, payload }) =>
            apiRequest(id ? `/suppliers/${id}` : "/suppliers", {
                method: id ? "PATCH" : "POST",
                body: JSON.stringify(payload),
            }),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: suppliersQueryKey });
        },
    });
}
