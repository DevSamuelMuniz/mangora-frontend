import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiRequest } from "@/lib/api/client";
import type { AccountCategory, CostCenter, FinancialEntry, FinancialEntryType, FinancialOverview } from "@/types/financial";
import type { PaymentMethod } from "@/types/sale";

/**
 * Domínio financeiro — hooks de estado de servidor.
 * Invalidação de ["financial"] reflete pagamentos, estornos e recorrências;
 * cost-centers/account-categories têm query keys próprias.
 */

export const financialQueryKey = ["financial"] as const;
export const costCentersQueryKey = ["financial", "cost-centers"] as const;
export const accountCategoriesQueryKey = ["financial", "account-categories"] as const;

export function useFinancialOverview() {
    return useQuery<FinancialOverview, Error>({
        queryKey: financialQueryKey,
        queryFn: () => apiRequest<FinancialOverview>("/financial"),
    });
}

export type PayFinancialEntryInput = {
    amount: number;
    interest?: number;
    discount?: number;
    paymentMethod: PaymentMethod;
    paidAt: string;
    notes?: string;
};

export function useCreateFinancialEntry() {
    const queryClient = useQueryClient();
    return useMutation<FinancialEntry, Error, Record<string, unknown>>({
        mutationFn: (payload) =>
            apiRequest<FinancialEntry>("/financial", {
                method: "POST",
                body: JSON.stringify(payload),
            }),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: financialQueryKey });
        },
    });
}

export function usePayFinancialEntry() {
    const queryClient = useQueryClient();
    return useMutation<unknown, Error, { id: string; input: PayFinancialEntryInput }>({
        mutationFn: ({ id, input }) =>
            apiRequest(`/financial/${id}/pay`, {
                method: "PATCH",
                body: JSON.stringify(input),
            }),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: financialQueryKey });
        },
    });
}

export function useReverseFinancialEntry() {
    const queryClient = useQueryClient();
    return useMutation<unknown, Error, { id: string; reason: string }>({
        mutationFn: ({ id, reason }) =>
            apiRequest(`/financial/${id}/reverse`, {
                method: "POST",
                body: JSON.stringify({ reason }),
            }),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: financialQueryKey });
        },
    });
}

export function useGenerateRecurring() {
    const queryClient = useQueryClient();
    return useMutation<{ generated: number }, Error, void>({
        mutationFn: () => apiRequest<{ generated: number }>("/financial/recurring/generate", { method: "POST" }),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: financialQueryKey });
        },
    });
}

export function useCostCenters() {
    return useQuery<CostCenter[], Error>({
        queryKey: costCentersQueryKey,
        queryFn: () => apiRequest<CostCenter[]>("/financial/cost-centers"),
    });
}

export function useCreateCostCenter() {
    const queryClient = useQueryClient();
    return useMutation<CostCenter, Error, string>({
        mutationFn: (name) => apiRequest<CostCenter>("/financial/cost-centers", { method: "POST", body: JSON.stringify({ name }) }),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: costCentersQueryKey });
        },
    });
}

export function useUpdateCostCenter() {
    const queryClient = useQueryClient();
    return useMutation<CostCenter, Error, { id: string; name: string; active: boolean }>({
        mutationFn: ({ id, name, active }) => apiRequest<CostCenter>(`/financial/cost-centers/${id}`, { method: "PATCH", body: JSON.stringify({ name, active }) }),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: costCentersQueryKey });
        },
    });
}

export function useAccountCategories() {
    return useQuery<AccountCategory[], Error>({
        queryKey: accountCategoriesQueryKey,
        queryFn: () => apiRequest<AccountCategory[]>("/financial/account-categories"),
    });
}

export function useCreateAccountCategory() {
    const queryClient = useQueryClient();
    return useMutation<AccountCategory, Error, { code: string; name: string; type: FinancialEntryType }>({
        mutationFn: (input) => apiRequest<AccountCategory>("/financial/account-categories", { method: "POST", body: JSON.stringify(input) }),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: accountCategoriesQueryKey });
        },
    });
}

export function useUpdateAccountCategory() {
    const queryClient = useQueryClient();
    return useMutation<AccountCategory, Error, { id: string; code: string; name: string; type: FinancialEntryType; active: boolean }>({
        mutationFn: ({ id, code, name, type, active }) => apiRequest<AccountCategory>(`/financial/account-categories/${id}`, { method: "PATCH", body: JSON.stringify({ code, name, type, active }) }),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: accountCategoriesQueryKey });
        },
    });
}
