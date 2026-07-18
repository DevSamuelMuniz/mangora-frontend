import type { Category } from "./category";

export type Service = {
  id: string;
  companyId: string;
  name: string;
  code: string;
  sku: string;
  categoryId: string;
  category: string;
  categoryRef: Category;
  itemType: "SERVICE";
  description: string | null;
  price: number;
  durationMinutes: number | null;
  active: boolean;
  imageUrl: string | null;
  publicVisible: boolean;
  createdAt: string;
  updatedAt: string;
};
