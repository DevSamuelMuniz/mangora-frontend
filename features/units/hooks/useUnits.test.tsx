import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useCreateUnit } from "./useUnits";
import { createWrapper, jsonResponse } from "@/test/query-helpers";

describe("useCreateUnit", () => {
    afterEach(() => vi.restoreAllMocks());

    it("não envia documento parcial (exige 11 ou 14 dígitos)", async () => {
        const fetchMock = vi.fn(async () => jsonResponse(undefined, 204));
        vi.stubGlobal("fetch", fetchMock);

        const { result } = renderHook(() => useCreateUnit(), { wrapper: createWrapper() });
        await result.current.mutateAsync({ tradeName: "Loja 2", document: "12345678", confirmAdditionalCharge: true });

        const [, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
        const body = JSON.parse(String(init.body)) as Record<string, unknown>;
        expect(body.document).toBeNull();
        expect(fetchMock).toHaveBeenCalledWith(
            "/api/backend/companies/units",
            expect.objectContaining({ method: "POST" }),
        );
    });

    it("envia documento válido (14 dígitos) e email vazio como undefined", async () => {
        const fetchMock = vi.fn(async () => jsonResponse(undefined, 204));
        vi.stubGlobal("fetch", fetchMock);

        const { result } = renderHook(() => useCreateUnit(), { wrapper: createWrapper() });
        await result.current.mutateAsync({ tradeName: "Loja 2", document: "12345678000195", email: "", confirmAdditionalCharge: true });

        const [, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
        const body = JSON.parse(String(init.body)) as Record<string, unknown>;
        expect(body.document).toBe("12345678000195");
        expect(body.email).toBeUndefined();
    });
});
