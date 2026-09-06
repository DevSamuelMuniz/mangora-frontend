import type { Product } from "./product";

export type StockMovementType = "ENTRY" | "EXIT" | "ADJUSTMENT" | "TRANSFER_IN" | "TRANSFER_OUT";
export type ManualStockMovementType = "ENTRY" | "EXIT" | "ADJUSTMENT";

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
  transfer?: {
    id: string;
    sourceCompany: { id: string; tradeName: string };
    destinationCompany: { id: string; tradeName: string };
  } | null;
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
  type: ManualStockMovementType;
  quantity: number;
  unitCost?: number;
  reason: string;
  notes?: string;
};


export type StockTransferStatus = "SENT" | "RECEIVED" | "CONFIRMED" | "CANCELLED";
export type StockTransferSide = "SOURCE" | "DESTINATION";

export type StockTransfer = {
  id: string;
  businessGroupId: string;
  sourceCompanyId: string;
  destinationCompanyId: string;
  sourceProductId: string;
  destinationProductId: string;
  createdByName: string;
  quantity: number;
  status: StockTransferStatus;
  receivedQuantity: number | null;
  receivedByName: string | null;
  receivedAt: string | null;
  confirmedByName: string | null;
  confirmedAt: string | null;
  notes: string | null;
  discrepancy: number | null;
  side: StockTransferSide;
  createdAt: string;
  sourceCompany: { id: string; tradeName: string; unitCode: string | null };
  destinationCompany: { id: string; tradeName: string; unitCode: string | null };
  sourceProduct: { id: string; name: string; sku: string };
  destinationProduct: { id: string; name: string; sku: string };
};

export const transferStatusLabels: Record<StockTransferStatus, string> = {
  SENT: "Enviada",
  RECEIVED: "Recebida",
  CONFIRMED: "Confirmada",
  CANCELLED: "Cancelada",
};


export type StockCountStatus = "DRAFT" | "COMPLETED" | "CANCELLED";

export type StockCount = {
  id: string;
  companyId: string;
  createdByName: string;
  name: string | null;
  status: StockCountStatus;
  notes: string | null;
  completedAt: string | null;
  completedByName: string | null;
  createdAt: string;
  items: Array<{
    id: string;
    productId: string;
    expectedStock: number;
    countedStock: number;
    difference: number;
    product: { id: string; name: string; sku: string; stock: number };
  }>;
};

export type ProductBatch = {
  id: string;
  code: string;
  quantity: number;
  unitCost: number;
  expiresAt: string | null;
  receivedByName: string;
  createdAt: string;
  product: { id: string; name: string; sku: string };
};

export const stockCountStatusLabels: Record<StockCountStatus, string> = {
  DRAFT: "Em contagem",
  COMPLETED: "Concluída",
  CANCELLED: "Cancelada",
};
