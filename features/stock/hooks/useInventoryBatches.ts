import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiRequest } from "@/lib/api/client";
import type { ProductBatch, StockCount } from "@/types/stock";

const inventoryKey = ["stock", "inventory"] as const;

export function useStockCounts() {
  return useQuery<StockCount[], Error>({
    queryKey: inventoryKey,
    queryFn: () => apiRequest<StockCount[]>("/inventory"),
  });
}

export function useCreateStockCount() {
  const queryClient = useQueryClient();
  return useMutation<StockCount, Error, { name?: string; notes?: string }>({
    mutationFn: (input) => apiRequest<StockCount>("/inventory", { method: "POST", body: JSON.stringify(input) }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: inventoryKey }),
  });
}

export function useAddCountItems() {
  const queryClient = useQueryClient();
  return useMutation<StockCount, Error, { id: string; items: { productId: string; countedStock: number }[] }>({
    mutationFn: ({ id, items }) => apiRequest<StockCount>(`/inventory/${id}/items`, { method: "POST", body: JSON.stringify({ items }) }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: inventoryKey }),
  });
}

export function useCompleteStockCount() {
  const queryClient = useQueryClient();
  return useMutation<StockCount, Error, string>({
    mutationFn: (id) => apiRequest<StockCount>(`/inventory/${id}/complete`, { method: "POST" }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: inventoryKey });
      void queryClient.invalidateQueries({ queryKey: ["stock"] });
    },
  });
}

export function useCancelStockCount() {
  const queryClient = useQueryClient();
  return useMutation<StockCount, Error, string>({
    mutationFn: (id) => apiRequest<StockCount>(`/inventory/${id}/cancel`, { method: "POST" }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: inventoryKey }),
  });
}

const batchesKey = ["stock", "batches"] as const;

export function useProductBatches(productId: string | null) {
  return useQuery<ProductBatch[], Error>({
    queryKey: [...batchesKey, productId ?? "none"],
    queryFn: () => apiRequest<ProductBatch[]>(`/batches${productId ? `?productId=${productId}` : ""}`),
    enabled: Boolean(productId),
  });
}

export function useCreateBatch() {
  const queryClient = useQueryClient();
  return useMutation<ProductBatch, Error, { productId: string; code: string; quantity: number; unitCost: number; expiresAt?: string }>({
    mutationFn: (input) => apiRequest<ProductBatch>("/batches", { method: "POST", body: JSON.stringify(input) }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: batchesKey });
      void queryClient.invalidateQueries({ queryKey: ["stock"] });
    },
  });
}
