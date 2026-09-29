import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { StockOverviewResponse } from "@/types/stock";
import { useCreateStockMovement, useStockOverview } from "./useStockOverview";
import { createWrapper, fetchCallsTo, jsonResponse } from "@/test/query-helpers";

const overview: StockOverviewResponse = {
    products: [],
    movements: [],
    summary: { totalUnits: 0, inventoryValue: 0, lowStockCount: 0, outOfStockCount: 0 },
};

describe("useStockOverview", () => {
    afterEach(() => vi.restoreAllMocks());

    it("busca a visão de estoque via BFF", async () => {
        vi.stubGlobal("fetch", vi.fn(async () => jsonResponse(overview)));
        const { result } = renderHook(() => useStockOverview(), { wrapper: createWrapper() });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(result.current.data).toEqual(overview);
        expect(fetch).toHaveBeenCalledWith("/api/backend/stock", expect.any(Object));
    });
});

describe("useCreateStockMovement", () => {
    afterEach(() => vi.restoreAllMocks());

    it("faz POST /stock/movements e invalida o estoque", async () => {
        const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
            const method = input instanceof Request ? input.method : "GET";
            if (method === "POST") return jsonResponse({ id: "m1" }, 201);
            return jsonResponse(overview);
        });
        vi.stubGlobal("fetch", fetchMock);

        const { result } = renderHook(
            () => ({ overview: useStockOverview(), create: useCreateStockMovement() }),
            { wrapper: createWrapper() },
        );
        await waitFor(() => expect(result.current.overview.isSuccess).toBe(true));
        const callsAfterLoad = fetchCallsTo(fetchMock, "/stock");

        await result.current.create.mutateAsync({ productId: "p1", type: "ENTRY", quantity: 5, reason: "Compra" });
        expect(fetchMock).toHaveBeenCalledWith(
            "/api/backend/stock/movements",
            expect.objectContaining({ method: "POST" }),
        );
        await waitFor(() => expect(fetchCallsTo(fetchMock, "/stock")).toBeGreaterThan(callsAfterLoad));
    });
});
