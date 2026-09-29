import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { Customer } from "@/types/customer";
import { useCustomers, useDeleteCustomer } from "./useCustomers";
import { createWrapper, fetchCallsTo, jsonResponse } from "@/test/query-helpers";

const customer = { id: "c1", name: "Maria", active: true } as Customer;

describe("useCustomers", () => {
    afterEach(() => vi.restoreAllMocks());

    it("busca a lista de clientes via BFF", async () => {
        vi.stubGlobal("fetch", vi.fn(async () => jsonResponse([customer])));
        const { result } = renderHook(() => useCustomers(), { wrapper: createWrapper() });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(result.current.data).toEqual([customer]);
        expect(fetch).toHaveBeenCalledWith("/api/backend/customers", expect.any(Object));
    });
});

describe("useDeleteCustomer", () => {
    afterEach(() => vi.restoreAllMocks());

    it("faz DELETE /customers/:id", async () => {
        vi.stubGlobal("fetch", vi.fn(async () => jsonResponse(undefined, 204)));
        const { result } = renderHook(() => useDeleteCustomer(), { wrapper: createWrapper() });

        await result.current.mutateAsync({ id: customer.id });
        expect(fetch).toHaveBeenCalledWith(
            `/api/backend/customers/${customer.id}`,
            expect.objectContaining({ method: "DELETE" }),
        );
    });

    it("invalida a lista após excluir (refetch)", async () => {
        const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
            const method = input instanceof Request ? input.method : "GET";
            if (method === "DELETE") return jsonResponse(undefined, 204);
            return jsonResponse([customer]);
        });
        vi.stubGlobal("fetch", fetchMock);

        const { result } = renderHook(
            () => ({ list: useCustomers(), remove: useDeleteCustomer() }),
            { wrapper: createWrapper() },
        );
        await waitFor(() => expect(result.current.list.isSuccess).toBe(true));
        const callsAfterLoad = fetchCallsTo(fetchMock, "/customers");

        await result.current.remove.mutateAsync({ id: customer.id });
        await waitFor(() => expect(fetchCallsTo(fetchMock, "/customers")).toBeGreaterThan(callsAfterLoad));
    });
});
