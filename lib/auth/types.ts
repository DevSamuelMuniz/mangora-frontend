export type MembershipRole =
  | "OWNER"
  | "ADMIN"
  | "MANAGER"
  | "CASHIER"
  | "SELLER"
  | "EMPLOYEE";

export type AuthSession = {
  sessionId: string;
  expiresAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    country: string | null;
    locale: string | null;
    preferredCurrency: string | null;
    timezone: string | null;
  };
  membership: {
    id: string;
    role: MembershipRole;
  };
  company: {
    id: string;
    tradeName: string;
    slug: string;
    segment: string;
    status: "ACTIVE" | "SUSPENDED";
    country: string;
    locale: string;
    preferredCurrency: string;
    timezone: string;
    subscriptionPlan: "FREE" | "START" | "BUSINESS" | "PREMIUM" | "ENTERPRISE";
    subscriptionStatus: "TRIAL" | "PENDING" | "ACTIVE" | "PAST_DUE" | "CANCELLED";
    trialEndsAt: string | null;
    trialDaysRemaining: number;
    trialExpired: boolean;
    accessBlocked: boolean;
  };
  security: {
    emailVerified: boolean;
    mfaEnabled: boolean;
    mfaVerified: boolean;
    mfaRequired: boolean;
    nextStep: "email" | "enroll" | "mfa" | null;
  };
};

export const roleLabels: Record<MembershipRole, string> = {
  OWNER: "Proprietário",
  ADMIN: "Administrador",
  MANAGER: "Gerente",
  CASHIER: "Operador de caixa",
  SELLER: "Vendedor",
  EMPLOYEE: "Funcionário",
};
