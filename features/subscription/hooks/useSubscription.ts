import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { updateBillingAccess } from "@/lib/billing/access";
import { apiRequest } from "@/lib/api/client";
import type { SubscriptionOverview } from "@/types/subscription";

/**
 * Domínio de assinatura — hooks de estado de servidor.
 * Fase 5: carregar assinatura e registrar solicitações/checkout/cancelamento,
 * com invalidação automática do overview.
 */

export const subscriptionQueryKey = ["subscription"] as const;

export function useSubscription(enabled = true) {
    const router = useRouter();
    const queryClient = useQueryClient();
    useEffect(() => {
        const refresh = () => { void queryClient.invalidateQueries({ queryKey: subscriptionQueryKey }); };
        window.addEventListener("mangora:subscription-payment-required", refresh);
        return () => window.removeEventListener("mangora:subscription-payment-required", refresh);
    }, [queryClient]);
    const previousBlocked = useRef<boolean | undefined>(undefined);
    const result = useQuery<SubscriptionOverview, Error>({
        enabled,
        refetchOnWindowFocus: true,
        refetchInterval: (query) => query.state.data?.pendingPlan || query.state.data?.accessBlocked ? 15_000 : 60_000,
        retry: 1,
        queryKey: subscriptionQueryKey,
        queryFn: ({ signal }) => apiRequest<SubscriptionOverview>("/subscription", { signal }),
    });
    useEffect(() => {
        if (!result.data) return;
        updateBillingAccess({ blocked: result.data.accessBlocked, blockAt: result.data.enforcement?.blockAt });
        if (previousBlocked.current !== undefined && previousBlocked.current !== result.data.accessBlocked) router.refresh();
        previousBlocked.current = result.data.accessBlocked;
    }, [result.data, router]);
    return result;
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
        onSuccess: async (overview) => {
            await queryClient.cancelQueries({ queryKey: subscriptionQueryKey });
            queryClient.setQueryData(subscriptionQueryKey, overview);
            void queryClient.invalidateQueries();
            router.refresh();
        },
    });
}

export function useSubscriptionAccess(enabled = true) {
    const result = useQuery<Pick<SubscriptionOverview, "accessBlocked" | "enforcement" | "billingDueAt" | "evaluatedAt">>({
        queryKey: ["subscription", "access"], enabled, retry: 1,
        refetchOnWindowFocus: true, refetchInterval: 30_000,
        queryFn: ({ signal }) => apiRequest("/subscription/access", { signal }),
    });
    useEffect(() => {
        if (enabled && result.data) updateBillingAccess({ blocked: result.data.accessBlocked, blockAt: result.data.enforcement?.blockAt });
    }, [enabled, result.data]);
    return result;
}
