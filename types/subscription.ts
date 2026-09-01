export type PlanId = "free" | "start" | "business" | "premium" | "enterprise";

export type SubscriptionPlan = {
  id: PlanId;
  name: string;
  price: number | null;
  description: string;
  features: string[];
  highlighted?: boolean;
};

export type SubscriptionUsage = {
  label: string;
  current: number;
  limit: number | null;
};

export type SubscriptionInvoice = {
  id: string;
  reference: string;
  dueDate: string;
  amount: number;
  status: "PENDING" | "CONFIRMED" | "RECEIVED" | "OVERDUE" | "REFUNDED" | "CANCELLED";
  billingType: "BOLETO" | "PIX" | null;
  paidAt: string | null;
  invoiceUrl: string | null;
  bankSlipUrl: string | null;
};

export type SubscriptionOverview = {
  plan: "FREE" | "START" | "BUSINESS" | "PREMIUM" | "ENTERPRISE";
  planName: string;
  status: "TRIAL" | "PENDING" | "ACTIVE" | "PAST_DUE" | "CANCELLED";
  trialEndsAt: string | null;
  trialDaysRemaining: number;
  trialExpired: boolean;
  accessBlocked: boolean;
  price: number;
  nextBillingAt: string | null;
  paymentMethod: string | null;
  pendingPlan: "START" | "BUSINESS" | "PREMIUM" | null;
  provider: { name: "ASAAS"; configured: boolean; environment: "sandbox" | "production"; customerConnected: boolean; subscriptionConnected: boolean };
  usage: Array<{ key: string; label: string; current: number; limit: number | null }>;
  plans: Array<{ id: string; name: string; price: number | null; ownerLimit: number | null; employeeLimit: number | null; unitLimit: number | null }>;
  requests: Array<{ id: string; type: "PLAN_CHANGE" | "CANCELLATION" | "CONTACT"; targetPlan: string | null; status: string; requestedByName: string; createdAt: string }>;
  invoices: SubscriptionInvoice[];
};
