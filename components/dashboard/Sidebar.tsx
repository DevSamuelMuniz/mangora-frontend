"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BarChart3,
  Banknote,
  Boxes,
  Building2,
  ChevronDown,
  CircleDollarSign,
  CreditCard,
  FileText,
  FolderTree,
  ClipboardList,
  LayoutDashboard,
  Package,
  Settings,
  ShoppingBag,
  Store,
  Truck,
  Wrench,
  Users,
  WalletCards,
  X,
  type LucideIcon,
} from "lucide-react";
import { roleLabels, type AuthSession, type MembershipRole } from "@/lib/auth/types";

type SidebarProps = {
  open: boolean;
  onClose: () => void;
  session: AuthSession;
};

type NavigationItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  roles?: MembershipRole[];
};

const navigation: NavigationItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Vendas",
    href: "/vendas",
    icon: ShoppingBag,
  },
  {
    label: "Caixa",
    href: "/caixa",
    icon: Banknote,
    roles: ["OWNER", "ADMIN", "MANAGER", "CASHIER"],
  },
  {
    label: "Pedidos",
    href: "/pedidos",
    icon: FileText,
  },
  {
    label: "Produtos",
    href: "/produtos",
    icon: Package,
  },
  {
    label: "Estoque",
    href: "/estoque",
    icon: Boxes,
  },
  {
    label: "Serviços",
    href: "/servicos",
    icon: Wrench,
    roles: ["OWNER", "ADMIN", "MANAGER"],
  },
  {
    label: "Categorias",
    href: "/categorias",
    icon: FolderTree,
    roles: ["OWNER", "ADMIN", "MANAGER"],
  },
  {
    label: "Compras",
    href: "/compras",
    icon: ClipboardList,
    roles: ["OWNER", "ADMIN", "MANAGER"],
  },
  {
    label: "Fornecedores",
    href: "/fornecedores",
    icon: Truck,
    roles: ["OWNER", "ADMIN", "MANAGER"],
  },
  {
    label: "Clientes",
    href: "/clientes",
    icon: Users,
  },
  {
    label: "Financeiro",
    href: "/financeiro",
    icon: CircleDollarSign,
    roles: ["OWNER", "ADMIN", "MANAGER"],
  },
  {
    label: "Relatórios",
    href: "/relatorios",
    icon: BarChart3,
    roles: ["OWNER", "ADMIN", "MANAGER"],
  },
];

const secondaryNavigation: NavigationItem[] = [
  {
    label: "Funcionários",
    href: "/funcionarios",
    icon: Building2,
    roles: ["OWNER", "ADMIN"],
  },
  {
    label: "Assinatura",
    href: "/assinatura",
    icon: CreditCard,
    roles: ["OWNER"],
  },
  {
    label: "Configurações",
    href: "/configuracoes",
    icon: Settings,
    roles: ["OWNER", "ADMIN"],
  },
];

export default function Sidebar({
  open,
  onClose,
  session,
}: SidebarProps) {
  const pathname = usePathname();
  const [companyOpen, setCompanyOpen] = useState(false);
  const visibleNavigation = navigation.filter((item) => !item.roles || item.roles.includes(session.membership.role));
  const visibleSecondaryNavigation = secondaryNavigation.filter((item) => !item.roles || item.roles.includes(session.membership.role));

  function isActive(href: string) {
    if (href === "/dashboard") {
      return pathname === href;
    }

    return pathname.startsWith(href);
  }

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Fechar menu"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/30 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-300 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5">
          <Link
            href="/dashboard"
            className="flex items-center gap-3"
            onClick={onClose}
          >
            <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 shadow-md shadow-violet-200">
              <LayoutDashboard className="size-4.5 text-white" />
            </div>

            <div>
              <p className="text-base font-black tracking-tight text-slate-950">
                Gestão<span className="text-violet-600">+</span>
              </p>

              <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                Gestão inteligente
              </p>
            </div>
          </Link>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar menu"
            className="flex size-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 lg:hidden"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="relative px-3 py-4">
          <button
            type="button"
            onClick={() => setCompanyOpen((current) => !current)}
            aria-expanded={companyOpen}
            className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-left transition hover:border-violet-200 hover:bg-violet-50"
          >
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-700">
              <Store className="size-4" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-slate-800">
                {session.company.tradeName}
              </p>
              <p className="truncate text-[10px] text-slate-400">
                {roleLabels[session.membership.role]}
              </p>
            </div>

            <ChevronDown className="size-4 text-slate-400" />
          </button>

          {companyOpen && (
            <div
              role="menu"
              aria-label="Menu da empresa"
              className="absolute inset-x-3 top-[4.5rem] z-20 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl"
            >
              <div className="px-3 py-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                  Empresa atual
                </p>
                <p className="mt-1 text-xs font-black text-slate-800">
                  {session.company.tradeName}
                </p>
              </div>
              {(session.membership.role === "OWNER" || session.membership.role === "ADMIN") && <Link
                href="/configuracoes"
                role="menuitem"
                onClick={() => {
                  setCompanyOpen(false);
                  onClose();
                }}
                className="flex rounded-lg px-3 py-2 text-[11px] font-semibold text-slate-600 hover:bg-violet-50 hover:text-violet-700"
              >
                Editar dados da empresa
              </Link>}
              {session.membership.role === "OWNER" && <Link
                href="/assinatura"
                role="menuitem"
                onClick={() => {
                  setCompanyOpen(false);
                  onClose();
                }}
                className="flex rounded-lg px-3 py-2 text-[11px] font-semibold text-slate-600 hover:bg-violet-50 hover:text-violet-700"
              >
                Gerenciar assinatura
              </Link>}
            </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto px-3 pb-4">
          <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
            Principal
          </p>

          <div className="space-y-1">
            {visibleNavigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition ${
                    active
                      ? "bg-violet-50 text-violet-700"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                  }`}
                >
                  <Icon
                    className={`size-4.5 ${
                      active
                        ? "text-violet-600"
                        : "text-slate-400"
                    }`}
                  />

                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="my-4 h-px bg-slate-200" />

          <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
            Administração
          </p>

          <div className="space-y-1">
            {visibleSecondaryNavigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition ${
                    active
                      ? "bg-violet-50 text-violet-700"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                  }`}
                >
                  <Icon
                    className={`size-4.5 ${
                      active
                        ? "text-violet-600"
                        : "text-slate-400"
                    }`}
                  />

                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>

        {session.membership.role === "OWNER" && <div className="border-t border-slate-200 p-3">
          <div className="rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 p-3 text-white">
            <div className="flex items-center gap-2">
              <WalletCards className="size-4 text-violet-100" />

              <p className="text-xs font-bold">
                Assinatura da empresa
              </p>
            </div>

            <p className="mt-2 text-[10px] leading-4 text-white/70">
              Consulte o plano, o uso e as solicitações de atendimento.
            </p>

            <Link
              href="/assinatura"
              className="mt-3 flex h-8 items-center justify-center rounded-lg bg-white/15 text-[11px] font-bold transition hover:bg-white/25"
            >
              Gerenciar plano
            </Link>
          </div>
        </div>}
      </aside>
    </>
  );
}
