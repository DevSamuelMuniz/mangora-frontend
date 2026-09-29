import type { ReactNode } from "react";

/**
 * Botão de paginação.
 * Fase 5: fonte única — antes duplicado em SalesCatalog, CustomerCatalog
 * e FinancialOverview.
 */
export function PageButton({
    label,
    disabled,
    onClick,
    children,
}: {
    label?: string;
    disabled: boolean;
    onClick: () => void;
    children: ReactNode;
}) {
    return (
        <button
            type="button"
            aria-label={label}
            disabled={disabled}
            onClick={onClick}
            className="flex size-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
            {children}
        </button>
    );
}
