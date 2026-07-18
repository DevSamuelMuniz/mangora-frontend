export type OrderStatus = "NEW" | "PREPARING" | "READY" | "COMPLETED" | "CANCELLED";
export type OrderChannel = "COUNTER" | "ONLINE" | "WHATSAPP" | "PHONE";
export type FulfillmentMethod = "PICKUP" | "DELIVERY" | "ON_SITE";

export type OrderItem = {
  id: string; orderId: string; productId: string | null; productName: string; sku: string;
  quantity: number; unitPrice: number; subtotal: number; trackStock: boolean;
};

export type Order = {
  id: string; companyId: string; customerId: string | null; number: number; code: string;
  status: OrderStatus; channel: OrderChannel; fulfillment: FulfillmentMethod; customerName: string;
  customerPhone: string | null;
  createdByName: string; scheduledAt: string; subtotal: number; discount: number; total: number;
  notes: string | null; completedAt: string | null; cancelledAt: string | null;
  cancelReason: string | null; createdAt: string; updatedAt: string; items: OrderItem[];
  sale: { id: string; number: number; code: string; total: number; status: string } | null;
};

export const orderStatusLabels: Record<OrderStatus, string> = { NEW: "Novo", PREPARING: "Em preparação", READY: "Pronto", COMPLETED: "Concluído", CANCELLED: "Cancelado" };
export const orderChannelLabels: Record<OrderChannel, string> = { COUNTER: "Balcão", ONLINE: "Online", WHATSAPP: "WhatsApp", PHONE: "Telefone" };
export const fulfillmentLabels: Record<FulfillmentMethod, string> = { PICKUP: "Retirada", DELIVERY: "Entrega", ON_SITE: "Atendimento local" };
