import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api/client";

export const operationPinQueryKey = ["operation-pin"] as const;

export function useOperationPin() {
  return useQuery<{ configured: boolean; canManage: boolean; updatedAt: string | null }, Error>({
    queryKey: operationPinQueryKey,
    queryFn: () => apiRequest("/auth/operation-pin"),
  });
}

export function useSendOperationPinCode() {
  return useMutation<{ sent: boolean; email: string; resendAfterSeconds: number }, Error, void>({
    gcTime: 0,
    mutationFn: () => apiRequest("/auth/operation-pin/email/send", { method: "POST" }),
  });
}

export function useVerifyOperationPinCode() {
  return useMutation<{ verificationToken: string }, Error, string>({
    gcTime: 0,
    mutationFn: emailCode => apiRequest("/auth/operation-pin/email/verify", { method: "POST", body: JSON.stringify({ emailCode }) }),
  });
}

export function useSetOperationPin() {
  const client = useQueryClient();
  return useMutation<{ configured: boolean }, Error, { verificationToken: string; password: string }>({
    gcTime: 0,
    mutationFn: input => apiRequest("/auth/operation-pin", { method: "PUT", body: JSON.stringify(input) }),
    onSuccess: () => { void client.invalidateQueries({ queryKey: operationPinQueryKey }); },
  });
}
