// Compatibilidade: o catálogo canônico vive em lib/plans.ts.
export { subscriptionPlans } from "@/lib/plans";

export function invoiceStatus(status: string) { return ({ PENDING: "pending", CONFIRMED: "confirmed", RECEIVED: "received", OVERDUE: "overdue", REFUNDED: "refunded", CANCELLED: "cancelled" } as Record<string, string>)[status] ?? "pending"; }
