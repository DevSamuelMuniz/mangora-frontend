export type CustomerType = "INDIVIDUAL" | "COMPANY";

export type Customer = {
  id: string;
  companyId: string;
  type: CustomerType;
  name: string;
  tradeName: string | null;
  document: string;
  email: string;
  phone: string;
  active: boolean;
  postalCode: string | null;
  street: string | null;
  number: string | null;
  district: string | null;
  city: string | null;
  state: string | null;
  notes: string | null;
  lastPurchaseAt: string | null;
  totalSpent: number;
  createdAt: string;
  updatedAt: string;
};

export type CustomerInput = {
  type: CustomerType;
  name: string;
  tradeName: string | null;
  document: string;
  email: string;
  phone: string;
  active: boolean;
  postalCode: string | null;
  street: string | null;
  number: string | null;
  district: string | null;
  city: string | null;
  state: string | null;
  notes: string | null;
};
