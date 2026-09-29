import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiRequest } from "@/lib/api/client";
import type { Product } from "@/types/product";
import type { Category } from "@/types/category";

/**
 * Domínio de produtos — hooks de estado de servidor.
 *
 * Fase 3: fonte única para listar/excluir produtos. A definição de
 * "produto" (itemType === "PRODUCT", excluindo serviços) vive aqui.
 */

export const productsQueryKey = ["products"] as const;

export function useProducts() {
    return useQuery<Product[], Error>({
        queryKey: productsQueryKey,
        queryFn: async () =>
            (await apiRequest<Product[]>("/products")).filter((item) => item.itemType === "PRODUCT"),
    });
}

export function useDeleteProduct() {
    const queryClient = useQueryClient();
    return useMutation<void, Error, { id: string }>({
        mutationFn: ({ id }) => apiRequest<void>(`/products/${id}`, { method: "DELETE" }),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: productsQueryKey });
        },
    });
}

/** Dados do formulário de produto: categorias (PRODUCT) + entidade em edição. */
export function useProductForm(productId: string | null) {
    return useQuery<{ categories: Category[]; product: Product | null }, Error>({
        queryKey: ["product-form", productId ?? "new"],
        queryFn: async () => {
            const [categories, product] = await Promise.all([
                apiRequest<Category[]>("/categories?itemType=PRODUCT"),
                productId ? apiRequest<Product>(`/products/${productId}`) : Promise.resolve(null),
            ]);
            return { categories: categories.filter((item) => item.active || item.id === product?.categoryId), product };
        },
    });
}

export function useSaveProduct() {
    const queryClient = useQueryClient();
    return useMutation<Product, Error, { id?: string | null; payload: Record<string, unknown> }>({
        mutationFn: ({ id, payload }) =>
            apiRequest<Product>(id ? `/products/${id}` : "/products", {
                method: id ? "PATCH" : "POST",
                body: JSON.stringify(payload),
            }),
        onSuccess: () => {
            // Produto afeta o catálogo e a visão de estoque.
            void Promise.all([
                queryClient.invalidateQueries({ queryKey: productsQueryKey }),
                queryClient.invalidateQueries({ queryKey: ["stock"] }),
            ]);
        },
    });
}
