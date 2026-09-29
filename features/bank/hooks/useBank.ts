import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiRequest } from "@/lib/api/client";
import type { AccountType, BankAccount, BankTransaction } from "@/types/bank";

const bankAccountsKey = ["bank", "accounts"] as const;
const bankTransactionsKey = (accountId: string) => ["bank", "accounts", accountId, "transactions"] as const;

function normalizeAccount(account: Record<string, unknown>): BankAccount {
  return { ...account, openingBalance: Number(account.openingBalance ?? 0) } as unknown as BankAccount;
}

function normalizeTransaction(transaction: Record<string, unknown>): BankTransaction {
  return { ...transaction, amount: Number(transaction.amount ?? 0) } as unknown as BankTransaction;
}

export function useBankAccounts() {
  return useQuery<BankAccount[], Error>({
    queryKey: bankAccountsKey,
    queryFn: async () => {
      const raw = await apiRequest<Record<string, unknown>[]>("/bank/accounts");
      return raw.map(normalizeAccount);
    },
  });
}

export function useCreateBankAccount() {
  const queryClient = useQueryClient();
  return useMutation<BankAccount, Error, { name: string; type: AccountType; institution?: string; agency?: string; accountNumber?: string; pixKey?: string; openingBalance?: number }>({
    mutationFn: (input) => apiRequest<Record<string, unknown>>("/bank/accounts", { method: "POST", body: JSON.stringify(input) }).then(normalizeAccount),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: bankAccountsKey });
    },
  });
}

export function useBankTransactions(accountId: string | null) {
  return useQuery<BankTransaction[], Error>({
    queryKey: bankTransactionsKey(accountId ?? "none"),
    queryFn: async () => {
      const raw = await apiRequest<Record<string, unknown>[]>(`/bank/accounts/${accountId}/transactions`);
      return raw.map(normalizeTransaction);
    },
    enabled: Boolean(accountId),
  });
}

export function useImportStatement() {
  const queryClient = useQueryClient();
  return useMutation<{ parsed: number; imported: number; skipped: number }, Error, { accountId: string; format: "ofx" | "csv"; content: string }>({
    mutationFn: ({ accountId, format, content }) => apiRequest(`/bank/accounts/${accountId}/import`, { method: "POST", body: JSON.stringify({ format, content }) }),
    onSuccess: (_result, variables) => {
      void queryClient.invalidateQueries({ queryKey: bankTransactionsKey(variables.accountId) });
    },
  });
}

export function useReconcileAccount() {
  const queryClient = useQueryClient();
  return useMutation<{ unmatched: number; matched: number }, Error, string>({
    mutationFn: (accountId) => apiRequest(`/bank/accounts/${accountId}/reconcile`, { method: "POST" }),
    onSuccess: (_result, accountId) => {
      void queryClient.invalidateQueries({ queryKey: bankTransactionsKey(accountId) });
    },
  });
}

export function useMatchTransaction() {
  const queryClient = useQueryClient();
  return useMutation<unknown, Error, { accountId: string; transactionId: string; financialEntryId: string }>({
    mutationFn: ({ transactionId, financialEntryId }) => apiRequest(`/bank/transactions/${transactionId}/match`, { method: "PATCH", body: JSON.stringify({ financialEntryId }) }),
    onSuccess: (_result, variables) => {
      void queryClient.invalidateQueries({ queryKey: bankTransactionsKey(variables.accountId) });
    },
  });
}

export function useIgnoreTransaction() {
  const queryClient = useQueryClient();
  return useMutation<unknown, Error, { accountId: string; transactionId: string }>({
    mutationFn: ({ transactionId }) => apiRequest(`/bank/transactions/${transactionId}/ignore`, { method: "PATCH" }),
    onSuccess: (_result, variables) => {
      void queryClient.invalidateQueries({ queryKey: bankTransactionsKey(variables.accountId) });
    },
  });
}
