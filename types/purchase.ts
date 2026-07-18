export type PurchaseStatus = "PENDING" | "RECEIVED" | "CANCELLED";
export type Purchase = {
  id: string; companyId: string; supplierId: string; number: number; code: string; status: PurchaseStatus;
  supplierName: string; createdByName: string; issueDate: string; dueDate: string; subtotal: number; total: number;
  notes: string | null; receivedAt: string | null; receivedByName: string | null; cancelledAt: string | null;
  cancelledByName: string | null; cancelReason: string | null; createdAt: string;
  supplier: { id: string; legalName: string; tradeName: string | null; document: string | null };
  items: { id: string; productId: string; productName: string; sku: string; quantity: number; unitCost: number; subtotal: number }[];
  financialEntry: { id: string; status: string; dueDate: string } | null;
};
