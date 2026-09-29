import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { Sale } from "@/types/sale";
import { useCreateSale, useSales } from "./useSales";

function createWrapper() {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
    });
    return function Wrapper({ children }: { children: ReactNode }) {
        return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
    };
}

const jsonResponse = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json" },
    });

const sale = { id: "s1", code: "V-1", total: 100 } as Sale;

describe("useSales", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("busca a lista de vendas via BFF com a sessão (cookie)", async () => {
        vi.stubGlobal("fetch", vi.fn(async () => jsonResponse([sale])));
        const { result } = renderHook(() => useSales(), { wrapper: createWrapper() });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(result.current.data).toEqual([sale]);
        expect(fetch).toHaveBeenCalledWith(
            "/api/backend/sales",
            expect.objectContaining({ credentials: "include" }),
        );
    });
});

describe("useCreateSale", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("faz POST /sales e devolve a venda criada", async () => {
        vi.stubGlobal("fetch", vi.fn(async () => jsonResponse(sale, 201)));
        const { result } = renderHook(() => useCreateSale(), { wrapper: createWrapper() });

        const created = await result.current.mutateAsync({
            paymentMethod: "PIX",
            discount: 0,
            items: [{ productId: "p1", quantity: 1 }],
        });

        expect(created).toEqual(sale);
        expect(fetch).toHaveBeenCalledWith(
            "/api/backend/sales",
            expect.objectContaining({ method: "POST" }),
        );
    });

    it("invalida a lista de vendas após criar (refetch automático)", async () => {
        const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
            const url = String(input);
            if (url.endsWith("/sales") && (input instanceof Request ? input.method : "GET") === "GET") return jsonResponse([sale]);
            return jsonResponse(sale, 201);
        });
        vi.stubGlobal("fetch", fetchMock);

        const { result } = renderHook(
            () => ({ list: useSales(), create: useCreateSale() }),
            { wrapper: createWrapper() },
        );
        await waitFor(() => expect(result.current.list.isSuccess).toBe(true));
        const callsAfterLoad = fetchMock.mock.calls.filter(([input]) => String(input).endsWith("/sales")).length;

        await result.current.create.mutateAsync({
            paymentMethod: "PIX",
            discount: 0,
            items: [{ productId: "p1", quantity: 1 }],
        });
        await waitFor(() => {
            const listCalls = fetchMock.mock.calls.filter(([input]) => String(input).endsWith("/sales")).length;
            expect(listCalls).toBeGreaterThan(callsAfterLoad);
        });
    });
});
