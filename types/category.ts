export type CatalogItemType = "PRODUCT" | "SERVICE";

export type Category = {
  id: string;
  companyId: string;
  name: string;
  itemType: CatalogItemType;
  description: string | null;
  active: boolean;
  _count: { products: number };
  createdAt: string;
  updatedAt: string;
};
