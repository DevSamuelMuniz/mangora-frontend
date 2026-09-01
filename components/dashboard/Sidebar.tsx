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
  Star,
  Store,
  Truck,
  Wrench,
  Users,
  WalletCards,
  X,
  type LucideIcon,
} from "lucide-react";
import { roleLabels, type AuthSession, type MembershipRole } from "@/lib/auth/types";
import BrandLogo from "@/components/brand/BrandLogo";
import { can } from "@/lib/permissions";
import { useSwitchCompany, useUnitGroup } from "@/features/units/hooks/useUnits";

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

type NavigationGroup = { label: string; icon: LucideIcon; items: NavigationItem[] };

const navigationGroups: NavigationGroup[] = [
  { label: "Operação", icon: ShoppingBag, items: [
    { label: "Vendas", href: "/vendas", icon: ShoppingBag },
    { label: "Caixa", href: "/caixa", icon: Banknote, roles: ["OWNER", "ADMIN", "MANAGER", "CASHIER"] },
    { label: "Pedidos", href: "/pedidos", icon: FileText },
  ] },
  { label: "Catálogo", icon: Package, items: [
    { label: "Produtos", href: "/produtos", icon: Package },
    { label: "Serviços", href: "/servicos", icon: Wrench, roles: ["OWNER", "ADMIN", "MANAGER"] },
    { label: "Categorias", href: "/categorias", icon: FolderTree, roles: ["OWNER", "ADMIN", "MANAGER"] },
  ] },
  { label: "Suprimentos", icon: Boxes, items: [
    { label: "Estoque", href: "/estoque", icon: Boxes },
    { label: "Compras", href: "/compras", icon: ClipboardList, roles: ["OWNER", "ADMIN", "MANAGER"] },
    { label: "Fornecedores", href: "/fornecedores", icon: Truck, roles: ["OWNER", "ADMIN", "MANAGER"] },
  ] },
  { label: "Gestão", icon: CircleDollarSign, items: [
    { label: "Clientes", href: "/clientes", icon: Users },
    { label: "Financeiro", href: "/financeiro", icon: CircleDollarSign, roles: ["OWNER", "ADMIN", "MANAGER"] },
    { label: "Relatórios", href: "/relatorios", icon: BarChart3, roles: ["OWNER", "ADMIN", "MANAGER"] },
    { label: "Notas fiscais", href: "/notas-fiscais", icon: FileText, roles: ["OWNER", "ADMIN", "MANAGER"] },
    { label: "Avaliações", href: "/avaliacoes", icon: Star },
  ] },
];

const secondaryNavigation: NavigationItem[] = [
  {
    label: "Lojas",
    href: "/unidades",
    icon: Store,
    roles: ["OWNER", "ADMIN", "MANAGER"],
  },
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
  {
    label: "Configuração fiscal",
    href: "/configuracoes-fiscais",
    icon: FileText,
    roles: ["OWNER", "ADMIN"],
  },
];

export default function Sidebar({
  open,
  onClose,
  session,
}: SidebarProps) {
  const pathname = usePathname();
  const { data: group } = useUnitGroup();
  const switchCompany = useSwitchCompany();
  const [companyOpen, setCompanyOpen] = useState(false);
  const units = group?.units ?? [];
  const [switching, setSwitching] = useState("");
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => Object.fromEntries(navigationGroups.map((group) => [group.label, group.items.some((item) => pathname.startsWith(item.href))])));
  const visibleNavigationGroups = navigationGroups.map((group) => ({ ...group, items: group.items.filter((item) => !item.roles || item.roles.includes(session.membership.role)) })).filter((group) => group.items.length > 0);
  const visibleSecondaryNavigation = secondaryNavigation.filter((item) => !item.roles || item.roles.includes(session.membership.role));

  async function switchUnit(membershipId: string) {
    if (membershipId === session.membership.id) return setCompanyOpen(false);
    try {
      setSwitching(membershipId);
      await switchCompany.mutateAsync({ membershipId });
      window.location.assign("/dashboard?toast=Unidade%20alterada");
    } finally {
      setSwitching("");
    }
  }

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
        className={`mangora-sidebar fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-300 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5">
          <Link
            href="/dashboard"
            className="flex items-center gap-3"
            onClick={onClose}
          >
            <BrandLogo className="h-9" priority />
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
            className="mangora-company-switcher flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-left transition hover:border-orange-200 hover:bg-orange-50"
          >
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-700">
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
            <><button type="button" aria-label="Fechar seletor de lojas" onClick={() => setCompanyOpen(false)} className="fixed inset-0 z-10 cursor-default" /><div
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
              {units.map((unit) => <button key={unit.membershipId} type="button" role="menuitem" disabled={Boolean(switching)} onClick={() => void switchUnit(unit.membershipId)} className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[11px] font-semibold transition ${unit.current ? "bg-orange-50 text-orange-700" : "text-slate-600 hover:bg-slate-50"}`}><span className={`size-2 rounded-full ${unit.current ? "bg-orange-500" : "bg-slate-300"}`} /><span className="min-w-0 flex-1 truncate">{unit.company.unitCode ? `${unit.company.unitCode} · ` : ""}{unit.company.tradeName}</span>{switching === unit.membershipId && <span className="text-[9px]">Trocando...</span>}</button>)}
              <div className="my-1 h-px bg-slate-100" />
              <Link href="/unidades" role="menuitem" onClick={() => { setCompanyOpen(false); onClose(); }} className="flex rounded-lg px-3 py-2 text-[11px] font-bold text-orange-700 hover:bg-orange-50">Gerenciar lojas e consolidado</Link>
              {can(session.membership.role, "company:configure") && <Link
                href="/configuracoes"
                role="menuitem"
                onClick={() => {
                  setCompanyOpen(false);
                  onClose();
                }}
                className="flex rounded-lg px-3 py-2 text-[11px] font-semibold text-slate-600 hover:bg-orange-50 hover:text-orange-700"
              >
                Editar dados da empresa
              </Link>}
              {can(session.membership.role, "subscription:manage") && <Link
                href="/assinatura"
                role="menuitem"
                onClick={() => {
                  setCompanyOpen(false);
                  onClose();
                }}
                className="flex rounded-lg px-3 py-2 text-[11px] font-semibold text-slate-600 hover:bg-orange-50 hover:text-orange-700"
              >
                Gerenciar assinatura
              </Link>}
            </div></>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto px-3 pb-4">
          <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
            Principal
          </p>

          <div className="space-y-1">
            <Link href="/dashboard" onClick={onClose} className={`flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition ${pathname === "/dashboard" ? "bg-orange-50 text-orange-700" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"}`}>
              <LayoutDashboard className={`size-4.5 ${pathname === "/dashboard" ? "text-orange-600" : "text-slate-400"}`} />Dashboard
            </Link>
            {visibleNavigationGroups.map((group) => {
              const GroupIcon = group.icon;
              const active = group.items.some((item) => isActive(item.href));
              const expanded = Boolean(openGroups[group.label]);
              return <div key={group.label} className="rounded-xl">
                <button type="button" data-active={active} onClick={() => setOpenGroups((current) => ({ ...current, [group.label]: !expanded }))} aria-expanded={expanded} className="mangora-nav-group flex h-10 w-full items-center gap-3 rounded-xl px-3 text-sm font-semibold transition">
                  <GroupIcon className={`size-4.5 ${active ? "text-orange-600" : "text-slate-400"}`} />
                  <span className="flex-1 text-left">{group.label}</span>
                  <ChevronDown className={`size-3.5 text-slate-400 transition-transform ${expanded ? "rotate-180" : ""}`} />
                </button>
                {expanded && <div className="mb-1 ml-5 space-y-0.5 border-l border-white/15 pl-2">
                  {group.items.map((item) => { const ItemIcon = item.icon; const itemActive = isActive(item.href); return <Link key={item.href} href={item.href} data-active={itemActive} onClick={onClose} className="mangora-nav-child flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-xs font-semibold transition"><ItemIcon className="size-3.5" />{item.label}</Link>; })}
                </div>}
              </div>;
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
                      ? "bg-orange-50 text-orange-700"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                  }`}
                >
                  <Icon
                    className={`size-4.5 ${
                      active
                        ? "text-orange-600"
                        : "text-slate-400"
                    }`}
                  />

                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>

        {can(session.membership.role, "subscription:manage") && <div className="border-t border-slate-200 p-3">
          <div className="rounded-xl bg-gradient-to-br from-orange-600 to-amber-600 p-3 text-white">
            <div className="flex items-center gap-2">
              <WalletCards className="size-4 text-orange-100" />

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
