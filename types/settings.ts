export type SettingsTab = "company" | "preferences" | "sales" | "notifications" | "online" | "security";

export type CompanySettings = {
  id: string; tradeName: string; legalName: string | null; slug: string; segment: string;
  email: string | null; phone: string | null; document: string | null; postalCode: string | null;
  street: string | null; number: string | null; city: string | null; state: string | null;
  timezone: string; defaultPayment: "PIX" | "CASH" | "DEBIT_CARD" | "CREDIT_CARD" | "BOLETO";
  maximumDiscount: number; requireCustomer: boolean; allowPendingSales: boolean;
  lowStockNotification: boolean; overdueAccountNotification: boolean; saleNotification: boolean;
  summaryEmail: string | null; summaryFrequency: "daily" | "weekly" | "disabled";
  publicPageEnabled: boolean; publicDescription: string | null; publicWhatsapp: string | null;
  publicPickupEnabled: boolean; publicDeliveryEnabled: boolean;
  sessionTimeout: number; loginAttempts: number; status: "ACTIVE" | "SUSPENDED";
};
