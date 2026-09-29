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
import { getTranslator, getFormatters } from "@/i18n/server";
import { serverApiRequest } from "@/lib/api/server-client";

import type { DashboardData } from "@/types/analytics";

export default async function DashboardPage() {
    const session = await getCurrentSession();
    if (!session) redirect("/login");
    const dashboard = await serverApiRequest<DashboardData>("/analytics/dashboard");
    const { locale, t } = await getTranslator();
    const { formatCurrency, formatDateLong, formatNumber } = await getFormatters();
    const firstName = session.user.name.split(" ")[0] || session.user.name;
    const currentDate = formatDateLong(new Date(), locale);

    return (
<<<<<<< HEAD
            <section>
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                    <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-orange-600">
                            Visão geral
                        </p>

                        <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                            Olá, {firstName} 👋
                        </h1>

                        <p className="mt-1 text-xs text-slate-500">
                            Veja como está o desempenho da sua empresa hoje.
=======
            <section className="mangora-dashboard">
                <div className="mangora-dashboard-intro flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                    <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-orange-600">
                            {t("dashboard.intro.eyebrow")}
                        </p>

                        <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                            {t("dashboard.intro.greeting", { name: firstName })}
                        </h1>

                        <p className="mt-1 text-xs text-slate-500">
                            {t("dashboard.intro.subtitle")}
>>>>>>> 0e59a660a5acf0b652a188ddf2e8ccc96de79e4d
                        </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-500 shadow-sm">
                        {currentDate.charAt(0).toUpperCase() + currentDate.slice(1)}
                    </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <MetricCard
<<<<<<< HEAD
                        title="Faturamento hoje"
                        value={currencyFormatter.format(dashboard.metrics.revenue)}
                        description="Comparado com ontem"
                        variation={`${Math.abs(dashboard.metrics.revenueVariation).toLocaleString("pt-BR")}%`}
=======
                        title={t("dashboard.metrics.revenue")}
                        value={formatCurrency(dashboard.metrics.revenue, locale)}
                        description={t("dashboard.metrics.revenueHint")}
                        variation={`${formatNumber(Math.abs(dashboard.metrics.revenueVariation), locale)}%`}
>>>>>>> 0e59a660a5acf0b652a188ddf2e8ccc96de79e4d
                        trend={getTrend(dashboard.metrics.revenueVariation)}
                        icon={CircleDollarSign}
                        iconClassName="bg-green-50 text-green-600"
                    />

                    <MetricCard
<<<<<<< HEAD
                        title="Vendas realizadas"
                        value={dashboard.metrics.sales.toLocaleString("pt-BR")}
=======
                        title={t("dashboard.metrics.sales")}
                        value={formatNumber(dashboard.metrics.sales, locale)}
>>>>>>> 0e59a660a5acf0b652a188ddf2e8ccc96de79e4d
                        description="Comparado com ontem"
                        variation={`${formatNumber(Math.abs(dashboard.metrics.salesVariation), locale)}%`}
                        trend={getTrend(dashboard.metrics.salesVariation)}
                        icon={ShoppingBag}
                        iconClassName="bg-orange-50 text-orange-600"
                    />

                    <MetricCard
<<<<<<< HEAD
                        title="Ticket médio"
                        value={currencyFormatter.format(dashboard.metrics.averageTicket)}
                        description="Média por venda realizada"
                        variation={`${Math.abs(dashboard.metrics.ticketVariation).toLocaleString("pt-BR")}%`}
=======
                        title={t("dashboard.metrics.ticket")}
                        value={formatCurrency(dashboard.metrics.averageTicket, locale)}
                        description={t("dashboard.metrics.ticketHint")}
                        variation={`${formatNumber(Math.abs(dashboard.metrics.ticketVariation), locale)}%`}
>>>>>>> 0e59a660a5acf0b652a188ddf2e8ccc96de79e4d
                        trend={getTrend(dashboard.metrics.ticketVariation)}
                        icon={TrendingUp}
                        iconClassName="bg-yellow-50 text-yellow-600"
                    />

                    <MetricCard
<<<<<<< HEAD
                        title="Contas a receber"
                        value={currencyFormatter.format(dashboard.metrics.receivable)}
                        description={`${dashboard.metrics.receivableCount} recebimento(s) pendente(s)`}
                        variation={`${dashboard.metrics.receivableCount} conta(s)`}
=======
                        title={t("dashboard.metrics.receivable")}
                        value={formatCurrency(dashboard.metrics.receivable, locale)}
                        description={t("dashboard.metrics.receivableHint", { count: dashboard.metrics.receivableCount })}
                        variation={t("dashboard.metrics.receivableVariation", { count: dashboard.metrics.receivableCount })}
>>>>>>> 0e59a660a5acf0b652a188ddf2e8ccc96de79e4d
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
<<<<<<< HEAD
                            title="Clientes ativos"
                            value={dashboard.metrics.activeCustomers.toLocaleString("pt-BR")}
                            description={`${dashboard.metrics.newCustomersThisMonth} novo(s) cliente(s) neste mês`}
                            variation={`${dashboard.metrics.newCustomersThisMonth} novo(s)`}
=======
                            title={t("dashboard.metrics.customers")}
                            value={formatNumber(dashboard.metrics.activeCustomers, locale)}
                            description={t("dashboard.metrics.customersHint", { count: dashboard.metrics.newCustomersThisMonth })}
                            variation={t("dashboard.metrics.customersVariation", { count: dashboard.metrics.newCustomersThisMonth })}
>>>>>>> 0e59a660a5acf0b652a188ddf2e8ccc96de79e4d
                            trend={dashboard.metrics.newCustomersThisMonth > 0 ? "up" : "neutral"}
                            icon={Users}
                            iconClassName="bg-amber-50 text-amber-600"
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

function getTrend(value: number): "up" | "down" | "neutral" { return value > 0 ? "up" : value < 0 ? "down" : "neutral"; }
