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
  currency?: string;
  provider?: string | null;
  reference: string;
  dueDate: string;
  amount: number;
  status: "PENDING" | "CONFIRMED" | "RECEIVED" | "OVERDUE" | "REFUNDED" | "CANCELLED";
  billingType: "BOLETO" | "PIX" | null;
  paidAt: string | null;
  daysOverdue?: number;
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
  evaluatedAt: string;
  enforcement: { phase: "OK" | "GRACE" | "READ_ONLY" | "BLOCKED"; blocked: boolean; readOnly: boolean; daysOverdue: number; dueAt: string | null; blockAt: string | null; timezone: string };

  price: number;
  nextBillingAt: string | null;
  billingDueAt: string | null;
  paymentMethod: string | null;
  pendingPlan: "START" | "BUSINESS" | "PREMIUM" | null;
  cancellation: {
    requested: boolean;
    cancelled: boolean;
    active: boolean;
    effectiveAt: string | null;
    daysLeft: number | null;
  };
  contract: {
    planCatalogVersion: number;
    planSnapshot: unknown | null;
    notes: string;
  };
  history: Array<{
    id: string;
    type: "CREATED" | "PLAN_CHANGE_REQUESTED" | "PLAN_CHANGED" | "PRICE_CHANGED" | "DISCOUNT_UPDATED" | "CANCELLATION_REQUESTED" | "CANCELLED" | "REACTIVATED";
    userName: string;
    fromPlan: string | null;
    toPlan: string | null;
    fromPrice: number | null;
    toPrice: number | null;
    discount: number | null;
    coupon: string | null;
    notes: string | null;
    createdAt: string;
  }>;
  billingBreakdown: null | {
    planName: string;
    unitPrice: number;
    unitCount: number;
    total: number;
    calculationText: string;
    hasOverride: boolean;
  };
  market: null | { country: string; market: string; currency: string; locale: string; timezone: string };
  provider: { name: "ASAAS" | "PADDLE"; configured: boolean; environment: "sandbox" | "production" | "international"; customerConnected: boolean; subscriptionConnected: boolean };
  usage: Array<{ key: string; label: string; current: number; limit: number | null }>;
  plans: Array<{ id: string; name: string; price: number | null; ownerLimit: number | null; employeeLimit: number | null; unitLimit: number | null; regionalPrice: null | { formatted: string; currency: string; amount: number; provider: "ASAAS" | "PADDLE"; checkoutAvailable: boolean } }>;
  requests: Array<{ id: string; type: "PLAN_CHANGE" | "CANCELLATION" | "CONTACT"; targetPlan: string | null; status: string; requestedByName: string; createdAt: string }>;
  invoices: SubscriptionInvoice[];
};

export type InvoiceDetails = {
  id: string; reference: string; provider: string; currency: string; status: string; amount: number;
  netAmount: number | null; dueDate: string; paidAt: string | null; billingType: string | null;
  description: string | null; invoiceUrl: string | null; bankSlipUrl: string | null; receiptUrl: string | null;
  originalValue: number | null; interestValue: number | null;
  discount: { value?: number; type?: string; dueDateLimitDays?: number } | null;
  fine: { value?: number; type?: string } | null; interest: { value?: number; type?: string } | null;
  pix: { encodedImage: string; payload: string; expirationDate: string } | null;
  boleto: { identificationField: string; barCode: string; nossoNumero: string } | null;
  partial: boolean; actions: { refresh: boolean; pay: boolean; cancel: boolean };
};

export type SubscriptionInvoices = {
  items: SubscriptionInvoice[]; total: number; page: number; pageSize: number;
  summary: Array<{ status: string; currency: string; amount: number; count: number }>;
};
