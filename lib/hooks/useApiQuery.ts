import { useMutation, useQuery, type QueryKey, type UseMutationOptions, type UseQueryOptions } from "@tanstack/react-query";

import { apiRequest } from "@/lib/api/client";

/**
 * Hooks base de estado de servidor (TanStack Query).
 *
 * Fase 2c — Core: wrappers tipados sobre apiRequest para leitura (useApiQuery)
 * e escrita (useApiMutation) com cache/invalidação consistentes.
 * As telas client devem usar estes hooks em vez de fetch + useEffect/useState.
 */

export function useApiQuery<T>(
    key: QueryKey,
    path: string,
    options?: Omit<UseQueryOptions<T, Error>, "queryKey" | "queryFn">,
) {
    return useQuery<T, Error>({
        queryKey: key,
        queryFn: () => apiRequest<T>(path),
        ...options,
    });
}

export function useApiMutation<TData, TVariables>(
    path: string,
    options?: UseMutationOptions<TData, Error, TVariables>,
) {
    return useMutation<TData, Error, TVariables>({
        mutationFn: (variables) =>
            apiRequest<TData>(path, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(variables),
            }),
        ...options,
    });
}
