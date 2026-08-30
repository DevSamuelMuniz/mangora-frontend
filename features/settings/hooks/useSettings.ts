import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiRequest } from "@/lib/api/client";
import type { CompanySettings } from "@/types/settings";

/**
 * Domínio de configurações — hooks de estado de servidor.
 * Fase 5: dados da empresa + aba de segurança (sessões, auditoria, jobs).
 */

export const companySettingsQueryKey = ["company-settings"] as const;
export const securityQueryKey = ["security-overview"] as const;

export type SecuritySession = {
    id: string;
    current: boolean;
    ipAddress: string | null;
    userAgent: string | null;
    createdAt: string;
    expiresAt: string;
};

export type AuditEntry = {
    id: string;
    action: string;
    userName: string;
    entityType: string;
    createdAt: string;
};

export type JobStatusData = {
    emails: { queued: number; sent: number; failed: number };
    recentRuns: { id: string; name: string; status: string; processed: number; error: string | null; startedAt: string }[];
};

export function useCompanySettings() {
    return useQuery<CompanySettings, Error>({
        queryKey: companySettingsQueryKey,
        queryFn: () => apiRequest<CompanySettings>("/companies/current"),
    });
}

export function useSaveCompanySettings() {
    const queryClient = useQueryClient();
    return useMutation<CompanySettings, Error, Record<string, unknown>>({
        mutationFn: (payload) =>
            apiRequest<CompanySettings>("/companies/current", { method: "PATCH", body: JSON.stringify(payload) }),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: companySettingsQueryKey });
        },
    });
}

export type SecurityOverview = {
    sessions: SecuritySession[];
    audit: AuditEntry[];
    jobs: JobStatusData;
};

export function useSecurityOverview() {
    return useQuery<SecurityOverview, Error>({
        queryKey: securityQueryKey,
        queryFn: async () => {
            const [sessions, audit, jobs] = await Promise.all([
                apiRequest<SecuritySession[]>("/auth/sessions"),
                apiRequest<AuditEntry[]>("/audit"),
                apiRequest<JobStatusData>("/jobs/status"),
            ]);
            return { sessions, audit, jobs };
        },
    });
}

export function useChangePassword() {
    return useMutation<unknown, Error, { currentPassword: string; newPassword: string }>({
        mutationFn: (payload) => apiRequest("/auth/change-password", { method: "POST", body: JSON.stringify(payload) }),
    });
}

export function useDeleteSession() {
    const queryClient = useQueryClient();
    return useMutation<unknown, Error, { id: string }>({
        mutationFn: ({ id }) => apiRequest(`/auth/sessions/${id}`, { method: "DELETE" }),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: securityQueryKey });
        },
    });
}

export function useRevokeOtherSessions() {
    const queryClient = useQueryClient();
    return useMutation<{ revoked: number }, Error, void>({
        mutationFn: () => apiRequest<{ revoked: number }>("/auth/sessions/revoke-others", { method: "POST" }),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: securityQueryKey });
        },
    });
}

export function useRunJob() {
    const queryClient = useQueryClient();
    return useMutation<unknown, Error, { path: "email" | "summaries" }>({
        mutationFn: ({ path }) => apiRequest(`/jobs/run/${path}`, { method: "POST" }),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: securityQueryKey });
        },
    });
}
