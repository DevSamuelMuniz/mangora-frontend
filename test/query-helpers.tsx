import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { vi } from "vitest";

/**
 * Helpers compartilhados para testes de hooks com TanStack Query.
 * Cria um QueryClient isolado por teste e mocks de Response para fetch.
 */
export function createWrapper() {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
    });
    return function Wrapper({ children }: { children: ReactNode }) {
        return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
    };
}

export const jsonResponse = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json" },
    });

/** Conta chamadas de fetch para uma URL exata. */
export function fetchCallsTo(fetchMock: ReturnType<typeof vi.fn>, url: string): number {
    return fetchMock.mock.calls.filter(([input]) => String(input).endsWith(url)).length;
}
