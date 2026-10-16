import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiRequest } from "@/lib/api/client";
import type { SubscriptionOverview } from "@/types/subscription";

/**
 * Domínio de assinatura — hooks de estado de servidor.
 * Fase 5: carregar assinatura e registrar solicitações/checkout/cancelamento,
 * com invalidação automática do overview.
 */

export const subscriptionQueryKey = ["subscription"] as const;

export function useSubscription(enabled = true) {
    return useQuery<SubscriptionOverview, Error>({
        enabled,
        refetchOnWindowFocus: true,
        refetchInterval: (query) => query.state.data?.pendingPlan || query.state.data?.accessBlocked ? 15_000 : false,
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
    return useMutation<{ originalPrice?: number; discount?: number; firstCharge?: number; recurringPrice?: number; checkoutUrl?: string; provider?: "ASAAS" | "PADDLE"; formatted?: string }, Error, { targetPlan: string; billingType?: "PIX" | "BOLETO"; nextDueDate?: string; couponCode?: string }>({
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


export function useReactivateSubscription() {
    const queryClient = useQueryClient();
    return useMutation<{ reactivated: boolean; activeThrough: string | null }, Error, void>({
        mutationFn: () => apiRequest("/subscription/reactivate", { method: "POST" }),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: subscriptionQueryKey });
        },
    });
}

export function useReconcileSubscription() {
    const queryClient = useQueryClient();
    const router = useRouter();
    return useMutation<SubscriptionOverview, Error, void>({
        mutationFn: () => apiRequest("/subscription/reconcile", { method: "POST" }),
        onSuccess: (overview) => {
            queryClient.setQueryData(subscriptionQueryKey, overview);
            void queryClient.invalidateQueries();
            router.refresh();
        },
    });
}
