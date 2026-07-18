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
