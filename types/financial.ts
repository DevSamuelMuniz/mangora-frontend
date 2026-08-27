export type FinancialEntryType = "INCOME" | "EXPENSE";
export type FinancialEntryStatus = "PENDING" | "PARTIALLY_PAID" | "PAID" | "OVERDUE" | "CANCELLED";
export type StoredFinancialEntryStatus = Exclude<FinancialEntryStatus, "OVERDUE">;

export type FinancialEntry = {
  id: string;
  code: string;
  companyId: string;
  saleId: string | null;
  createdByName: string;
  type: FinancialEntryType;
  status: StoredFinancialEntryStatus;
  displayStatus: FinancialEntryStatus;
  description: string;
  category: string;
  amount: number;
  paidAmount: number;
  outstandingAmount: number;
  dueDate: string;
  paidAt: string | null;
  account: string;
  contact: string | null;
  document: string | null;
  costCenter: string | null;
  paymentMethod: string | null;
  notes: string | null;
  cancelledAt: string | null;
  cancelReason: string | null;
  createdAt: string;
  updatedAt: string;
  payments: FinancialPayment[];
};

export type FinancialPayment = {
  id: string;
  financialEntryId: string;
  receivedByName: string;
  amount: number;
  paymentMethod: "PIX" | "CREDIT_CARD" | "DEBIT_CARD" | "CASH" | "BOLETO" | "CHECK" | "STORE_CREDIT";
  paidAt: string;
  notes: string | null;
};

export type FinancialOverview = {
  entries: FinancialEntry[];
  summary: { balance: number; paidIncome: number; paidExpense: number; receivable: number; payable: number };
  cashFlow: { key: string; month: string; income: number; expense: number }[];
};

export const financialTypeLabels: Record<FinancialEntryType, string> = { INCOME: "Receita", EXPENSE: "Despesa" };
export const financialStatusLabels: Record<FinancialEntryStatus, string> = { PENDING: "Pendente", PARTIALLY_PAID: "Pago parcialmente", PAID: "Pago", OVERDUE: "Vencido", CANCELLED: "Cancelado" };
