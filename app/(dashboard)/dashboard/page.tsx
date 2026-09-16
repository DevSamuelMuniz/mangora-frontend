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
                        </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-500 shadow-sm">
                        {currentDate.charAt(0).toUpperCase() + currentDate.slice(1)}
                    </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <MetricCard
                        title={t("dashboard.metrics.revenue")}
                        value={formatCurrency(dashboard.metrics.revenue, locale)}
                        description={t("dashboard.metrics.revenueHint")}
                        variation={`${formatNumber(Math.abs(dashboard.metrics.revenueVariation), locale)}%`}
                        trend={getTrend(dashboard.metrics.revenueVariation)}
                        icon={CircleDollarSign}
                        iconClassName="bg-green-50 text-green-600"
                    />

                    <MetricCard
                        title={t("dashboard.metrics.sales")}
                        value={formatNumber(dashboard.metrics.sales, locale)}
                        description="Comparado com ontem"
                        variation={`${formatNumber(Math.abs(dashboard.metrics.salesVariation), locale)}%`}
                        trend={getTrend(dashboard.metrics.salesVariation)}
                        icon={ShoppingBag}
                        iconClassName="bg-orange-50 text-orange-600"
                    />

                    <MetricCard
                        title={t("dashboard.metrics.ticket")}
                        value={formatCurrency(dashboard.metrics.averageTicket, locale)}
                        description={t("dashboard.metrics.ticketHint")}
                        variation={`${formatNumber(Math.abs(dashboard.metrics.ticketVariation), locale)}%`}
                        trend={getTrend(dashboard.metrics.ticketVariation)}
                        icon={TrendingUp}
                        iconClassName="bg-yellow-50 text-yellow-600"
                    />

                    <MetricCard
                        title={t("dashboard.metrics.receivable")}
                        value={formatCurrency(dashboard.metrics.receivable, locale)}
                        description={t("dashboard.metrics.receivableHint", { count: dashboard.metrics.receivableCount })}
                        variation={t("dashboard.metrics.receivableVariation", { count: dashboard.metrics.receivableCount })}
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
                            title={t("dashboard.metrics.customers")}
                            value={formatNumber(dashboard.metrics.activeCustomers, locale)}
                            description={t("dashboard.metrics.customersHint", { count: dashboard.metrics.newCustomersThisMonth })}
                            variation={t("dashboard.metrics.customersVariation", { count: dashboard.metrics.newCustomersThisMonth })}
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
