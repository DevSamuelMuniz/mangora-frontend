import {
    CircleDollarSign,
    CreditCard,
    ShoppingBag,
    TrendingUp,
    Users,
} from "lucide-react";
import { redirect } from "next/navigation";

import MetricCard from "@/components/dashboard/MetricCard";
import SalesChart from "@/components/dashboard/SalesChart";
import RecentSales from "@/components/dashboard/RecentSales";
import LowStock from "@/components/dashboard/LowStock";
import QuickActions from "@/components/dashboard/QuickActions";
import { getCurrentSession } from "@/lib/auth/server";
import { serverApiRequest } from "@/lib/api/server-client";
import type { DashboardData } from "@/types/analytics";

export default async function DashboardPage() {
    const session = await getCurrentSession();
    if (!session) redirect("/login");
    const dashboard = await serverApiRequest<DashboardData>("/analytics/dashboard");
    const firstName = session.user.name.split(" ")[0] || session.user.name;
    const currentDate = new Intl.DateTimeFormat("pt-BR", {
        weekday: "long",
        day: "numeric",
        month: "long",
    }).format(new Date());

    return (
            <section>
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                    <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-violet-600">
                            Visão geral
                        </p>

                        <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                            Olá, {firstName} 👋
                        </h1>

                        <p className="mt-1 text-xs text-slate-500">
                            Veja como está o desempenho da sua empresa hoje.
                        </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-500 shadow-sm">
                        {currentDate.charAt(0).toUpperCase() + currentDate.slice(1)}
                    </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <MetricCard
                        title="Faturamento hoje"
                        value={currencyFormatter.format(dashboard.metrics.revenue)}
                        description="Comparado com ontem"
                        variation={`${Math.abs(dashboard.metrics.revenueVariation).toLocaleString("pt-BR")}%`}
                        trend={getTrend(dashboard.metrics.revenueVariation)}
                        icon={CircleDollarSign}
                        iconClassName="bg-emerald-50 text-emerald-600"
                    />

                    <MetricCard
                        title="Vendas realizadas"
                        value={dashboard.metrics.sales.toLocaleString("pt-BR")}
                        description="Comparado com ontem"
                        variation={`${Math.abs(dashboard.metrics.salesVariation).toLocaleString("pt-BR")}%`}
                        trend={getTrend(dashboard.metrics.salesVariation)}
                        icon={ShoppingBag}
                        iconClassName="bg-violet-50 text-violet-600"
                    />

                    <MetricCard
                        title="Ticket médio"
                        value={currencyFormatter.format(dashboard.metrics.averageTicket)}
                        description="Média por venda realizada"
                        variation={`${Math.abs(dashboard.metrics.ticketVariation).toLocaleString("pt-BR")}%`}
                        trend={getTrend(dashboard.metrics.ticketVariation)}
                        icon={TrendingUp}
                        iconClassName="bg-cyan-50 text-cyan-600"
                    />

                    <MetricCard
                        title="Contas a receber"
                        value={currencyFormatter.format(dashboard.metrics.receivable)}
                        description={`${dashboard.metrics.receivableCount} recebimento(s) pendente(s)`}
                        variation={`${dashboard.metrics.receivableCount} conta(s)`}
                        trend="neutral"
                        icon={CreditCard}
                        iconClassName="bg-amber-50 text-amber-600"
                    />
                </div>

                <div className="mt-4 grid gap-4 xl:grid-cols-[1.55fr_0.75fr]">
                    <SalesChart charts={dashboard.charts} />

                    <div className="grid gap-4">
                        <QuickActions />

                        <MetricCard
                            title="Clientes ativos"
                            value={dashboard.metrics.activeCustomers.toLocaleString("pt-BR")}
                            description={`${dashboard.metrics.newCustomersThisMonth} novo(s) cliente(s) neste mês`}
                            variation={`${dashboard.metrics.newCustomersThisMonth} novo(s)`}
                            trend={dashboard.metrics.newCustomersThisMonth > 0 ? "up" : "neutral"}
                            icon={Users}
                            iconClassName="bg-indigo-50 text-indigo-600"
                        />
                    </div>
                </div>

                <div className="mt-4 grid gap-4 xl:grid-cols-2">
                    <RecentSales sales={dashboard.recentSales} />
                    <LowStock products={dashboard.lowStock} />
                </div>
            </section>
    );
}

const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
function getTrend(value: number): "up" | "down" | "neutral" { return value > 0 ? "up" : value < 0 ? "down" : "neutral"; }
