import type { SaleStatus } from "./sale";
import type { ReportDataset, ReportPeriod } from "./report";

export type DashboardChart = {
  label: string;
  description: string;
  revenue: number;
  variation: number;
  data: { label: string; value: number }[];
};

export type DashboardData = {
  metrics: {
    revenue: number;
    revenueVariation: number;
    sales: number;
    salesVariation: number;
    averageTicket: number;
    ticketVariation: number;
    receivable: number;
    receivableCount: number;
    activeCustomers: number;
    newCustomersThisMonth: number;
  };
  charts: Record<ReportPeriod, DashboardChart>;
  recentSales: Array<{ id: string; number: number; code: string; customerName: string; total: number; status: SaleStatus; createdAt: string }>;
  lowStock: Array<{ id: string; name: string; sku: string; stock: number; reservedStock: number; availableStock: number; minimumStock: number }>;
};

export type { ReportDataset };
