export type SaleStatus = "COMPLETED" | "CANCELLED";
export type PaymentMethod = "PIX" | "CREDIT_CARD" | "DEBIT_CARD" | "CASH" | "BOLETO" | "CHECK" | "STORE_CREDIT";

export type SaleItem = {
  id: string;
  saleId: string;
  productId: string | null;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  trackStock: boolean;
};

export type Sale = {
  id: string;
  companyId: string;
  customerId: string | null;
  number: number;
  code: string;
  customerName: string;
  customerDocument: string | null;
  createdByName: string;
  status: SaleStatus;
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  notes: string | null;
  cancelledAt: string | null;
  cancelledByName: string | null;
  cancelReason: string | null;
  createdAt: string;
  updatedAt: string;
  items: SaleItem[];
  receivable: {
    id: string;
    status: "PENDING" | "PARTIALLY_PAID" | "PAID" | "CANCELLED";
    dueDate: string;
    paidAmount: number;
    outstandingAmount: number;
  } | null;
  customer: { id: string; name: string; tradeName: string | null } | null;
};

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  PIX: "PIX",
  CREDIT_CARD: "Cartão de crédito",
  DEBIT_CARD: "Cartão de débito",
  CASH: "Dinheiro",
  BOLETO: "Boleto",
  CHECK: "Cheque",
  STORE_CREDIT: "Fiado",
};

export const saleStatusLabels: Record<SaleStatus, string> = {
  COMPLETED: "Concluída",
  CANCELLED: "Cancelada",
};
