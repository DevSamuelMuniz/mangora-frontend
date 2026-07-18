import type { ReportDataset, ReportPeriod } from "@/types/report";

const products = [
  { name: "Tênis esportivo branco", category: "Calçados", quantity: 42, revenue: 9235.8 },
  { name: "Jaqueta corta-vento", category: "Vestuário", quantity: 35, revenue: 6996.5 },
  { name: "Fone Bluetooth", category: "Eletrônicos", quantity: 48, revenue: 6235.2 },
  { name: "Configuração de equipamento", category: "Serviços", quantity: 39, revenue: 4680 },
  { name: "Camiseta básica preta", category: "Vestuário", quantity: 66, revenue: 3953.4 },
];

const payments = [
  { method: "PIX", amount: 18432, percentage: 42, colorClassName: "bg-violet-600" },
  { method: "Cartão de crédito", amount: 13165.71, percentage: 30, colorClassName: "bg-indigo-500" },
  { method: "Cartão de débito", amount: 7456.57, percentage: 17, colorClassName: "bg-cyan-500" },
  { method: "Dinheiro e outros", amount: 4825.72, percentage: 11, colorClassName: "bg-emerald-500" },
];

export const reportDatasets: Record<ReportPeriod, ReportDataset> = {
  "7d": {
    label: "Últimos 7 dias",
    comparisonLabel: "7 dias anteriores",
    metrics: { revenue: 18450, sales: 312, averageTicket: 59.13, newCustomers: 28, revenueVariation: 12.5, salesVariation: 8.2, ticketVariation: 3.1, customersVariation: 16.7 },
    performance: [
      { label: "Sex", revenue: 2210, previousRevenue: 1980 },
      { label: "Sáb", revenue: 2840, previousRevenue: 2320 },
      { label: "Dom", revenue: 1985, previousRevenue: 2040 },
      { label: "Seg", revenue: 2420, previousRevenue: 2150 },
      { label: "Ter", revenue: 2765, previousRevenue: 2380 },
      { label: "Qua", revenue: 3010, previousRevenue: 2640 },
      { label: "Qui", revenue: 3220, previousRevenue: 2890 },
    ],
    products: products.map((product) => ({ ...product, quantity: Math.max(4, Math.round(product.quantity * 0.24)), revenue: product.revenue * 0.24 })),
    payments: payments.map((payment) => ({ ...payment, amount: payment.amount * 0.42 })),
    income: 18450,
    expenses: 7140,
    recurringCustomers: 61,
  },
  "30d": {
    label: "Últimos 30 dias",
    comparisonLabel: "30 dias anteriores",
    metrics: { revenue: 43880, sales: 742, averageTicket: 59.14, newCustomers: 86, revenueVariation: 9.8, salesVariation: 7.4, ticketVariation: 2.2, customersVariation: 11.3 },
    performance: [
      { label: "Sem 1", revenue: 8940, previousRevenue: 8210 },
      { label: "Sem 2", revenue: 10320, previousRevenue: 9250 },
      { label: "Sem 3", revenue: 11240, previousRevenue: 10480 },
      { label: "Sem 4", revenue: 13380, previousRevenue: 12020 },
    ],
    products,
    payments,
    income: 43880,
    expenses: 17640,
    recurringCustomers: 68,
  },
  "90d": {
    label: "Últimos 90 dias",
    comparisonLabel: "90 dias anteriores",
    metrics: { revenue: 124560, sales: 2087, averageTicket: 59.68, newCustomers: 231, revenueVariation: 14.2, salesVariation: 10.6, ticketVariation: 3.4, customersVariation: 18.5 },
    performance: [
      { label: "Mai", revenue: 38210, previousRevenue: 34180 },
      { label: "Jun", revenue: 42470, previousRevenue: 37120 },
      { label: "Jul", revenue: 43880, previousRevenue: 40080 },
    ],
    products: products.map((product) => ({ ...product, quantity: product.quantity * 3, revenue: product.revenue * 3 })),
    payments: payments.map((payment) => ({ ...payment, amount: payment.amount * 2.84 })),
    income: 124560,
    expenses: 49280,
    recurringCustomers: 72,
  },
};
