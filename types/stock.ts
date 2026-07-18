import type { Product } from "./product";

export type StockMovementType = "ENTRY" | "EXIT" | "ADJUSTMENT";

export type StockMovement = {
  id: string;
  companyId: string;
  productId: string;
  createdByUserId: string | null;
  createdByName: string;
  type: StockMovementType;
  quantity: number;
  previousStock: number;
  newStock: number;
  unitCost: number | null;
  reason: string;
  notes: string | null;
  createdAt: string;
  product: {
    id: string;
    name: string;
    sku: string;
  };
};

export type StockOverviewResponse = {
  products: Product[];
  movements: StockMovement[];
  summary: {
    totalUnits: number;
    inventoryValue: number;
    lowStockCount: number;
    outOfStockCount: number;
  };
};

export type StockMovementInput = {
  productId: string;
  type: StockMovementType;
  quantity: number;
  unitCost?: number;
  reason: string;
  notes?: string;
};
