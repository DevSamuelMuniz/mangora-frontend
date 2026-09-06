export type AccountType = "CASH" | "BANK" | "PIX" | "CARD";
export type BankTransactionDirection = "CREDIT" | "DEBIT";
export type BankReconciliationStatus = "UNMATCHED" | "MATCHED" | "IGNORED";

export type BankAccount = {
  id: string;
  companyId: string;
  name: string;
  type: AccountType;
  institution: string | null;
  agency: string | null;
  accountNumber: string | null;
  pixKey: string | null;
  openingBalance: number;
  active: boolean;
};

export type BankTransaction = {
  id: string;
  companyId: string;
  bankAccountId: string;
  externalId: string | null;
  date: string;
  description: string;
  amount: number;
  direction: BankTransactionDirection;
  status: BankReconciliationStatus;
  financialEntryId: string | null;
  createdAt: string;
};

export const accountTypeLabels: Record<AccountType, string> = {
  CASH: "Caixa físico",
  BANK: "Conta bancária",
  PIX: "Carteira Pix",
  CARD: "Cartão",
};
