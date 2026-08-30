import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiRequest } from "@/lib/api/client";

export type NotificationItem = {
    id: string;
    title: string;
    description: string;
    type: string;
    readAt: string | null;
    createdAt: string;
};

/**
 * Domínio de notificações — hooks de estado de servidor.
 * Fase 5: carregar notificações e marcar todas como lidas (com atualização
 * otimista do cache).
 */

export const notificationsQueryKey = ["notifications"] as const;

export function useNotifications() {
    return useQuery<{ items: NotificationItem[] }, Error>({
        queryKey: notificationsQueryKey,
        queryFn: () => apiRequest<{ items: NotificationItem[] }>("/notifications"),
    });
}

export function useMarkAllNotificationsRead() {
    const queryClient = useQueryClient();
    return useMutation<{ updated: number }, Error, void>({
        mutationFn: () => apiRequest<{ updated: number }>("/notifications/read-all", { method: "POST" }),
        onSuccess: () => {
            // Otimista: marca como lidas no cache antes de refetch.
            queryClient.setQueryData<{ items: NotificationItem[] }>(notificationsQueryKey, (current) => {
                if (!current) return current;
                const readAt = new Date().toISOString();
                return { items: current.items.map((notification) => ({ ...notification, readAt: notification.readAt ?? readAt })) };
            });
            void queryClient.invalidateQueries({ queryKey: notificationsQueryKey });
        },
    });
}
