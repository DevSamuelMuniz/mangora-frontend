"use client";

import { CheckCircle2, ChevronRight, UserPlus, WalletCards } from "lucide-react";

import { formatCurrency } from "@/lib/format";
import { paymentMethodLabels, type PaymentMethod } from "@/types/sale";
import type { Customer } from "@/types/customer";

const PAYMENT_METHODS: PaymentMethod[] = ["PIX", "CREDIT_CARD", "DEBIT_CARD", "CASH", "BOLETO", "CHECK", "STORE_CREDIT"];
const DEFERRED: PaymentMethod[] = ["CHECK", "STORE_CREDIT"];

type PaymentPanelProps = {
    customers: Customer[];
    requireCustomer: boolean;
    customerId: string;
    onCustomer: (id: string) => void;
    onNewCustomer: () => void;
    paymentMethod: PaymentMethod;
    onPaymentMethod: (method: PaymentMethod) => void;
    dueDate: string;
    onDueDate: (date: string) => void;
    total: number;
    disabled: boolean;
    onReview: () => void;
};

/** Pagamento e finalização do terminal: cliente, forma de pagamento e botão. */
export default function PaymentPanel({
    customers,
    requireCustomer,
    customerId,
    onCustomer,
    onNewCustomer,
    paymentMethod,
    onPaymentMethod,
    dueDate,
    onDueDate,
    total,
    disabled,
    onReview,
}: PaymentPanelProps) {
    const deferred = DEFERRED.includes(paymentMethod);

    return (
        <div className="flex flex-col gap-4 rounded-2xl border-2 border-white/10 bg-[#0a2418] p-4">
            <div>
                <div className="flex items-center justify-between">
                    <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-white/70">
                        Cliente {requireCustomer ? "(obrigatório)" : "(opcional)"}
                    </p>
                    <button
                        type="button"
                        onClick={onNewCustomer}
                        className="flex h-7 items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 text-[10px] font-bold text-white transition hover:border-orange-400/50"
                    >
                        <UserPlus className="size-3" /> Novo cliente
                    </button>
                </div>
                <select
                    value={customerId}
                    onChange={(event) => onCustomer(event.target.value)}
                    className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-[#123d2b] px-3 text-sm font-semibold text-white outline-none focus:border-[#ffb21a]"
                >
                    <option value="">Consumidor final</option>
                    {customers.filter((customer) => customer.active).map((customer) => (
                        <option key={customer.id} value={customer.id}>{customer.tradeName || customer.name}</option>
                    ))}
                </select>
            </div>

            <div>
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-white/70">Pagamento</p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                    {PAYMENT_METHODS.map((method) => (
                        <button
                            key={method}
                            type="button"
                            onClick={() => onPaymentMethod(method)}
                            className={`flex h-11 items-center justify-center gap-1.5 rounded-xl border-2 text-xs font-bold transition ${
                                paymentMethod === method
                                    ? "border-[#ffb21a] bg-[#ffb21a]/15 text-[#ffb21a]"
                                    : "border-white/10 bg-white/5 text-white hover:bg-white/10"
                            }`}
                        >
                            <WalletCards className="size-3.5" />{paymentMethodLabels[method]}
                        </button>
                    ))}
                </div>
                {deferred && (
                    <label className="mt-3 block">
                        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-white/70">Vencimento</span>
                        <input type="date" value={dueDate} onChange={(event) => onDueDate(event.target.value)} className="mt-1.5 h-12 w-full rounded-xl border border-white/10 bg-[#123d2b] px-3 text-sm font-semibold text-white outline-none focus:border-[#ffb21a]" />
                    </label>
                )}
            </div>

            <button
                type="button"
                onClick={onReview}
                disabled={disabled}
                className="flex h-16 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 font-[family-name:var(--font-bricolage)] text-lg font-black text-white shadow-lg shadow-orange-950/50 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
            >
                <ChevronRight className="size-5" />Revisar venda — {formatCurrency(total)}
            </button>

            <p className="text-center font-mono text-[10px] text-white/60">
                <CheckCircle2 className="mr-1 inline size-3" />A venda atualiza estoque, financeiro e dashboard automaticamente.
            </p>
        </div>
    );
}
