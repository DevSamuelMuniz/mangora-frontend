export type Supplier = {
  id: string; companyId: string; legalName: string; tradeName: string | null; document: string | null;
  contactName: string | null; email: string | null; phone: string | null; active: boolean;
  postalCode: string | null; street: string | null; number: string | null; district: string | null;
  city: string | null; state: string | null; notes: string | null; createdAt: string; updatedAt: string;
};
