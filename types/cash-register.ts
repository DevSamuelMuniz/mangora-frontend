export type CashMovementType = "OPENING" | "SUPPLY" | "WITHDRAWAL" | "SALE" | "SALE_REVERSAL";

export type CashMovement = {
  id: string;
  type: CashMovementType;
  amount: number;
  description: string;
  createdByName: string;
  createdAt: string;
};

export type CashRegister = {
  id: string;
  status: "OPEN" | "CLOSED";
  openedByName: string;
  closedByName: string | null;
  openingAmount: number;
  expectedAmount: number;
  actualAmount: number | null;
  difference: number | null;
  openingNotes: string | null;
  closingNotes: string | null;
  openedAt: string;
  closedAt: string | null;
  movements: CashMovement[];
};

export type CashRegisterHistory = Omit<CashRegister, "movements" | "expectedAmount"> & { expectedAmount: number | null };
