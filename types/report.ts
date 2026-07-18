export type ReportPeriod = "7d" | "30d" | "90d";

export type ReportMetric = {
  revenue: number;
  sales: number;
  averageTicket: number;
  newCustomers: number;
  revenueVariation: number;
  salesVariation: number;
  ticketVariation: number;
  customersVariation: number;
};

export type PerformancePoint = {
  label: string;
  revenue: number;
  previousRevenue: number;
};

export type ProductPerformance = {
  name: string;
  category: string;
  quantity: number;
  revenue: number;
};

export type PaymentPerformance = {
  method: string;
  amount: number;
  percentage: number;
  colorClassName: string;
};

export type ReportDataset = {
  label: string;
  comparisonLabel: string;
  metrics: ReportMetric;
  performance: PerformancePoint[];
  products: ProductPerformance[];
  payments: PaymentPerformance[];
  income: number;
  expenses: number;
  recurringCustomers: number;
};
