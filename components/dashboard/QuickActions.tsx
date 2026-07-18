import Link from "next/link";
import {
  ArrowUpRight,
  CircleDollarSign,
  PackagePlus,
  ShoppingCart,
  UserPlus,
  type LucideIcon,
} from "lucide-react";

type QuickAction = {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  className: string;
};

const actions: QuickAction[] = [
  {
    title: "Nova venda",
    description: "Registrar uma venda",
    href: "/vendas/nova",
    icon: ShoppingCart,
    className: "bg-violet-50 text-violet-600",
  },
  {
    title: "Novo produto",
    description: "Adicionar ao catálogo",
    href: "/produtos/novo",
    icon: PackagePlus,
    className: "bg-cyan-50 text-cyan-600",
  },
  {
    title: "Novo cliente",
    description: "Cadastrar cliente",
    href: "/clientes/novo",
    icon: UserPlus,
    className: "bg-emerald-50 text-emerald-600",
  },
  {
    title: "Lançamento",
    description: "Registrar movimentação",
    href: "/financeiro/novo",
    icon: CircleDollarSign,
    className: "bg-amber-50 text-amber-600",
  },
];

export default function QuickActions() {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div>
        <h2 className="text-sm font-bold text-slate-950">
          Ações rápidas
        </h2>

        <p className="mt-0.5 text-[10px] text-slate-400">
          Acesse as principais funções
        </p>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <Link
              key={action.title}
              href={action.href}
              className="group flex items-center gap-3 rounded-xl border border-slate-200 p-3 transition hover:-translate-y-0.5 hover:border-violet-200 hover:bg-violet-50/40 hover:shadow-sm"
            >
              <div
                className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${action.className}`}
              >
                <Icon className="size-4.5" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-slate-800">
                  {action.title}
                </p>

                <p className="mt-0.5 truncate text-[9px] text-slate-400">
                  {action.description}
                </p>
              </div>

              <ArrowUpRight className="size-3.5 text-slate-300 transition group-hover:text-violet-600" />
            </Link>
          );
        })}
      </div>
    </article>
  );
}