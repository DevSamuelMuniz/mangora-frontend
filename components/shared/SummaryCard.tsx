import type { LucideIcon } from "lucide-react";

/**
 * Card de resumo (métrica) usado nos catálogos e dashboards.
 * Fase 5: fonte única — antes duplicado em SalesCatalog, CustomerCatalog,
 * StockOverview e FinancialOverview.
 */
export function SummaryCard({
    icon: Icon,
    label,
    value,
    description,
    iconClassName,
}: {
    icon: LucideIcon;
    label: string;
    value: string;
    description?: string;
    iconClassName: string;
}) {
    return (
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
                <div className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${iconClassName}`}>
                    <Icon className="size-4" />
                </div>
                <div className="min-w-0">
                    <p className="text-[10px] font-semibold text-slate-400">{label}</p>
                    <p className="mt-0.5 truncate text-lg font-black text-slate-950">{value}</p>
                </div>
            </div>
            {description && <p className="mt-2 text-[9px] text-slate-400">{description}</p>}
        </article>
    );
}
