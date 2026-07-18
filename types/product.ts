export type Product = {
  id: string;
  companyId: string;
  name: string;
  sku: string;
  barcode: string | null;
  category: string;
  categoryId: string;
  categoryRef?: { id: string; name: string };
  itemType: "PRODUCT" | "SERVICE";
  description: string | null;
  price: number;
  stock: number;
  reservedStock: number;
  minimumStock: number;
  durationMinutes: number | null;
  trackStock: boolean;
  active: boolean;
  imageUrl: string | null;
  publicVisible: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ProductInput = {
  name: string;
  sku: string;
  barcode: string | null;
  category: string;
  categoryId?: string;
  description: string | null;
  price: number;
  stock?: number;
  minimumStock: number;
  trackStock: boolean;
  active: boolean;
  imageUrl: string | null;
  publicVisible: boolean;
};
