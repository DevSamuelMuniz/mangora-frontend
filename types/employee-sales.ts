export type EmployeeSalesSummary = {
  salesCount: number;
  totalSold: number;
  averageTicket: number;
  discountGiven: number;
  cancelledCount: number;
  cancelledAmount: number;
  itemsSold: number;
};

export type EmployeeSaleItem = {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
};

export type EmployeeSalePayment = { method: string; amount: number };

export type EmployeeSale = {
  id: string;
  number: number;
  status: "COMPLETED" | "CANCELLED";
  createdAt: string;
  customerName: string;
  paymentMethod: string;
  subtotal: number;
  discount: number;
  total: number;
  cancelledAt: string | null;
  cancelReason: string | null;
  cancelledByName: string | null;
  payments: EmployeeSalePayment[];
  items: EmployeeSaleItem[];
};

/** Vendas de um funcionário no período, com resumo e detalhe por venda. */
export type EmployeeSalesReport = {
  employee: { id: string; userId: string; name: string; role: string; active: boolean };
  period: { from: string; to: string };
  pagination: { page: number; pageSize: number; total: number; totalPages: number };
  summary: EmployeeSalesSummary;
  payments: Array<{ method: string; amount: number; count: number }>;
  sales: EmployeeSale[];
};

export type EmployeeSalesRange = { from?: string; to?: string; page?: number };
