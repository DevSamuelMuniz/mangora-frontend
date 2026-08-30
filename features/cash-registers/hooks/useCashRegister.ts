import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiRequest } from "@/lib/api/client";
import type { CashMovementType, CashRegister, CashRegisterHistory } from "@/types/cash-register";

/**
 * Domínio de caixa — hooks de estado de servidor.
 * Fase 5: caixa atual + histórico e ações (abrir, movimentar, fechar),
 * com invalidação automática após cada operação.
 */

export const cashRegisterQueryKey = ["cash-register"] as const;

export type CashRegisterOverview = {
    register: CashRegister | null;
    history: CashRegisterHistory[];
};

export function useCashRegister() {
    return useQuery<CashRegisterOverview, Error>({
        queryKey: cashRegisterQueryKey,
        queryFn: async () => {
            const [register, history] = await Promise.all([
                apiRequest<CashRegister | null>("/cash-registers/current"),
                apiRequest<CashRegisterHistory[]>("/cash-registers/history"),
            ]);
            return { register, history };
        },
    });
}

export function useOpenRegister() {
    const queryClient = useQueryClient();
    return useMutation<unknown, Error, { openingAmount: number; notes?: string }>({
        mutationFn: (payload) => apiRequest("/cash-registers/open", { method: "POST", body: JSON.stringify(payload) }),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: cashRegisterQueryKey });
        },
    });
}

export function useRegisterMovement() {
    const queryClient = useQueryClient();
    return useMutation<unknown, Error, { type: Exclude<CashMovementType, "OPENING" | "SALE" | "SALE_REVERSAL">; amount: number; description?: string }>({
        mutationFn: (payload) => apiRequest("/cash-registers/movements", { method: "POST", body: JSON.stringify(payload) }),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: cashRegisterQueryKey });
        },
    });
}

export function useCloseRegister() {
    const queryClient = useQueryClient();
    return useMutation<unknown, Error, { actualAmount: number; notes?: string }>({
        mutationFn: (payload) => apiRequest("/cash-registers/close", { method: "POST", body: JSON.stringify(payload) }),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: cashRegisterQueryKey });
        },
    });
}
