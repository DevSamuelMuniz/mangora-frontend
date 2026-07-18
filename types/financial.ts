export type FinancialEntryType = "INCOME" | "EXPENSE";
export type FinancialEntryStatus = "PENDING" | "PAID" | "OVERDUE" | "CANCELLED";
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
};

export type FinancialOverview = {
  entries: FinancialEntry[];
  summary: { balance: number; paidIncome: number; paidExpense: number; receivable: number; payable: number };
  cashFlow: { key: string; month: string; income: number; expense: number }[];
};

export const financialTypeLabels: Record<FinancialEntryType, string> = { INCOME: "Receita", EXPENSE: "Despesa" };
export const financialStatusLabels: Record<FinancialEntryStatus, string> = { PENDING: "Pendente", PAID: "Pago", OVERDUE: "Vencido", CANCELLED: "Cancelado" };
