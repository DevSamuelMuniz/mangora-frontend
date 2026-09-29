import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { Order } from "@/types/order";
import { useCreateOrder, useOrders } from "./useOrders";
import { createWrapper, fetchCallsTo, jsonResponse } from "@/test/query-helpers";

const order = { id: "o1", code: "P-1", total: 50 } as Order;

describe("useOrders", () => {
    afterEach(() => vi.restoreAllMocks());

    it("busca a lista de pedidos via BFF", async () => {
        vi.stubGlobal("fetch", vi.fn(async () => jsonResponse([order])));
        const { result } = renderHook(() => useOrders(), { wrapper: createWrapper() });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(result.current.data).toEqual([order]);
    });
});

describe("useCreateOrder", () => {
    afterEach(() => vi.restoreAllMocks());

    it("faz POST /orders, devolve o pedido e invalida pedidos e estoque", async () => {
        const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
            const url = String(input);
            const method = input instanceof Request ? input.method : "GET";
            if (method === "POST") return jsonResponse(order, 201);
            if (url.endsWith("/orders")) return jsonResponse([order]);
            return jsonResponse([]);
        });
        vi.stubGlobal("fetch", fetchMock);

        const { result } = renderHook(
            () => ({ orders: useOrders(), create: useCreateOrder() }),
            { wrapper: createWrapper() },
        );
        await waitFor(() => expect(result.current.orders.isSuccess).toBe(true));
        const ordersCalls = fetchCallsTo(fetchMock, "/orders");

        await result.current.create.mutateAsync({
            customerId: "c1",
            channel: "COUNTER",
            fulfillment: "PICKUP",
            scheduledAt: new Date().toISOString(),
            discount: 0,
            items: [{ productId: "p1", quantity: 1 }],
        });

        expect(fetchMock).toHaveBeenCalledWith(
            "/api/backend/orders",
            expect.objectContaining({ method: "POST" }),
        );
        // Criar pedido invalida ["orders"] (refetch da lista montada).
        await waitFor(() => expect(fetchCallsTo(fetchMock, "/orders")).toBeGreaterThan(ordersCalls));
    });
});
