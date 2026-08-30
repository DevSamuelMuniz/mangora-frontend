import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiRequest } from "@/lib/api/client";
import type { SubscriptionOverview } from "@/types/subscription";

/**
 * Domínio de assinatura — hooks de estado de servidor.
 * Fase 5: carregar assinatura e registrar solicitações/checkout/cancelamento,
 * com invalidação automática do overview.
 */

export const subscriptionQueryKey = ["subscription"] as const;

export function useSubscription() {
    return useQuery<SubscriptionOverview, Error>({
        queryKey: subscriptionQueryKey,
        queryFn: () => apiRequest<SubscriptionOverview>("/subscription"),
    });
}

export function useSubscriptionRequest() {
    const queryClient = useQueryClient();
    return useMutation<void, Error, { action: string; targetPlan: string; notes?: string }>({
        mutationFn: (input) => apiRequest("/subscription/requests", { method: "POST", body: JSON.stringify(input) }),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: subscriptionQueryKey });
        },
    });
}

export function useSubscriptionCheckout() {
    const queryClient = useQueryClient();
    return useMutation<void, Error, { targetPlan: string; billingType: "PIX" | "BOLETO"; nextDueDate: string }>({
        mutationFn: (input) => apiRequest("/subscription/checkout", { method: "POST", body: JSON.stringify(input) }),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: subscriptionQueryKey });
        },
    });
}

export function useCancelSubscription() {
    const queryClient = useQueryClient();
    return useMutation<void, Error, void>({
        mutationFn: () => apiRequest("/subscription/cancel", { method: "POST" }),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: subscriptionQueryKey });
        },
    });
}
