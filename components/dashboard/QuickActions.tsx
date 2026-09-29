"use client";

import Link from "next/link";
import { useT } from "@/i18n/provider";
import {
  ArrowUpRight,
  CircleDollarSign,
  PackagePlus,
  ShoppingCart,
  UserPlus,
  type LucideIcon,
} from "lucide-react";

type QuickAction = {
  titleKey: string;
  descriptionKey: string;
  href: string;
  icon: LucideIcon;
  className: string;
};

const actions: QuickAction[] = [
  {
    titleKey: "newSale",
    descriptionKey: "newSaleHint",
    href: "/vendas?acao=novo",
    icon: ShoppingCart,
    className: "bg-orange-50 text-orange-600",
  },
  {
    titleKey: "newProduct",
    descriptionKey: "newProductHint",
    href: "/produtos?acao=novo",
    icon: PackagePlus,
    className: "bg-yellow-50 text-yellow-600",
  },
  {
    titleKey: "newCustomer",
    descriptionKey: "newCustomerHint",
    href: "/clientes?acao=novo",
    icon: UserPlus,
    className: "bg-green-50 text-green-600",
  },
  {
    titleKey: "entry",
    descriptionKey: "movementHint",
    href: "/financeiro?acao=novo",
    icon: CircleDollarSign,
    className: "bg-amber-50 text-amber-600",
  },
];

export default function QuickActions() {
  const t = useT();
  return (
    <article className="mangora-quick-actions rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div>
        <h2 className="text-sm font-bold text-slate-950">
          {t("dashboard.quickActions.title")}
        </h2>

        <p className="mt-0.5 text-[10px] text-slate-400">
          {t("dashboard.quickActions.subtitle")}
        </p>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <Link
              key={t(`dashboard.quickActions.${action.titleKey}`)}
              href={action.href}
              className="group flex items-center gap-3 rounded-xl border border-slate-200 p-3 transition hover:-translate-y-0.5 hover:border-orange-200 hover:bg-orange-50/40 hover:shadow-sm"
            >
              <div
                className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${action.className}`}
              >
                <Icon className="size-4.5" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-slate-800">
                  {t(`dashboard.quickActions.${action.titleKey}`)}
                </p>

                <p className="mt-0.5 truncate text-[9px] text-slate-400">
                  {t(`dashboard.quickActions.${action.descriptionKey}`)}
                </p>
              </div>

              <ArrowUpRight className="size-3.5 text-slate-300 transition group-hover:text-orange-600" />
            </Link>
          );
        })}
      </div>
    </article>
  );
}
