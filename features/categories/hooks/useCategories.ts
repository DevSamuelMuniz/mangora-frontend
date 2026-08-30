import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiRequest } from "@/lib/api/client";
import type { Category } from "@/types/category";

/**
 * Domínio de categorias — hooks de estado de servidor.
 * Fase 5: listar, salvar (criar/editar) e excluir categorias com invalidação.
 */

export const categoriesQueryKey = ["categories"] as const;

export function useCategories() {
    return useQuery<Category[], Error>({
        queryKey: categoriesQueryKey,
        queryFn: () => apiRequest<Category[]>("/categories"),
    });
}

export function useSaveCategory() {
    const queryClient = useQueryClient();
    return useMutation<Category, Error, { id?: string | null; payload: Record<string, unknown> }>({
        mutationFn: ({ id, payload }) =>
            apiRequest<Category>(id ? `/categories/${id}` : "/categories", {
                method: id ? "PATCH" : "POST",
                body: JSON.stringify(payload),
            }),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: categoriesQueryKey });
        },
    });
}

export function useDeleteCategory() {
    const queryClient = useQueryClient();
    return useMutation<void, Error, { id: string }>({
        mutationFn: ({ id }) => apiRequest<void>(`/categories/${id}`, { method: "DELETE" }),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: categoriesQueryKey });
        },
    });
}
