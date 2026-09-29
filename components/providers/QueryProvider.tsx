"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

/**
 * Provider global de estado de servidor (TanStack Query).
 *
 * Fase 2c — Core: habilita cache, invalidação, refetch e error handling
 * consistente em todas as telas client. Instanciado uma única vez por
 * sessão (useState lazy) para evitar recriação do QueryClient a cada render.
 */
export default function QueryProvider({ children }: { children: ReactNode }) {
    const [client] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 30_000,
                        retry: 1,
                        refetchOnWindowFocus: false,
                    },
                },
            }),
    );

    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
