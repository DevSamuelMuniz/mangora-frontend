import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiRequest } from "@/lib/api/client";
import type { Service } from "@/types/service";
import type { Category } from "@/types/category";

/**
 * Domínio de serviços — hooks de estado de servidor.
 * Fase 5: fonte única para listar/excluir serviços.
 */

export const servicesQueryKey = ["services"] as const;

export function useServices() {
    return useQuery<Service[], Error>({
        queryKey: servicesQueryKey,
        queryFn: () => apiRequest<Service[]>("/services"),
    });
}

export function useDeleteService() {
    const queryClient = useQueryClient();
    return useMutation<void, Error, { id: string }>({
        mutationFn: ({ id }) => apiRequest<void>(`/services/${id}`, { method: "DELETE" }),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: servicesQueryKey });
        },
    });
}

/** Dados do formulário de serviço: categorias (SERVICE) + entidade em edição. */
export function useServiceForm(serviceId: string | null) {
    return useQuery<{ categories: Category[]; service: Service | null }, Error>({
        queryKey: ["service-form", serviceId ?? "new"],
        queryFn: async () => {
            const [categories, service] = await Promise.all([
                apiRequest<Category[]>("/categories?itemType=SERVICE"),
                serviceId ? apiRequest<Service>(`/services/${serviceId}`) : Promise.resolve(null),
            ]);
            return { categories: categories.filter((item) => item.active || item.id === service?.categoryId), service };
        },
    });
}

export function useSaveService() {
    const queryClient = useQueryClient();
    return useMutation<unknown, Error, { id?: string | null; payload: Record<string, unknown> }>({
        mutationFn: ({ id, payload }) =>
            apiRequest(id ? `/services/${id}` : "/services", {
                method: id ? "PATCH" : "POST",
                body: JSON.stringify(payload),
            }),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: servicesQueryKey });
        },
    });
}
