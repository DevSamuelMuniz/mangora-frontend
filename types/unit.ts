import type { MembershipRole } from "@/lib/auth/types";

export type UnitCompany = {
  id: string;
  businessGroupId: string | null;
  unitCode: string | null;
  tradeName: string;
  legalName: string | null;
  slug: string;
  status: "ACTIVE" | "SUSPENDED";
};

export type UnitGroupResponse = {
  group: { id: string; name: string; createdAt: string } | null;
  limit: number;
  canCreateUnit: boolean;
  units: Array<{
    membershipId: string;
    role: MembershipRole;
    current: boolean;
    company: UnitCompany;
  }>;
};

export type ConsolidatedOverview = {
  group: { id: string; name: string } | null;
  label: string;
  summary: {
    revenue: number;
    sales: number;
    averageTicket: number;
    receivable: number;
    inventoryUnits: number;
    inventoryValue: number;
    lowStockCount: number;
  };
  units: Array<{
    id: string;
    tradeName: string;
    slug: string;
    unitCode: string | null;
    current: boolean;
    revenue: number;
    sales: number;
    averageTicket: number;
    receivable: number;
    inventoryUnits: number;
    inventoryValue: number;
    lowStockCount: number;
  }>;
};
