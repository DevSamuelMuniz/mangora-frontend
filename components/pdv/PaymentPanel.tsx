"use client";

import { CheckCircle2, ChevronRight, UserPlus, WalletCards } from "lucide-react";

import { formatCurrency, formatDocument } from "@/lib/format";
import { paymentMethodLabels, type PaymentMethod } from "@/types/sale";
import type { Customer } from "@/types/customer";

const PAYMENT_METHODS: PaymentMethod[] = ["PIX", "CREDIT_CARD", "DEBIT_CARD", "CASH", "BOLETO", "CHECK", "STORE_CREDIT"];
const DEFERRED: PaymentMethod[] = ["CHECK", "STORE_CREDIT"];

type PaymentStepProps = {
    customers: Customer[];
    requireCustomer: boolean;
    customerId: string;
    onCustomer: (id: string) => void;
    onNewCustomer: () => void;
    paymentMethod: PaymentMethod;
    onPaymentMethod: (method: PaymentMethod) => void;
    dueDate: string;
    onDueDate: (date: string) => void;
    customerDocument: string;
    onCustomerDocument: (value: string) => void;
    total: number;
    onPay: () => void;
};

/** Etapa 3 — cliente, CPF na nota e forma de pagamento; efetuar o pagamento. */
export default function PaymentStep({
    customers,
    requireCustomer,
    customerId,
    onCustomer,
    onNewCustomer,
    paymentMethod,
    onPaymentMethod,
    dueDate,
    onDueDate,
    customerDocument,
    onCustomerDocument,
    total,
    onPay,
}: PaymentStepProps) {
    const deferred = DEFERRED.includes(paymentMethod);

    return (
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 rounded-2xl border-2 border-white/10 bg-[#0a2418] p-6">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-orange-400">Etapa 3 de 4</p>
                    <h2 className="font-[family-name:var(--font-bricolage)] text-2xl font-black text-white">Pagamento</h2>
                </div>
                <div className="text-right">
                    <p className="font-mono text-[10px] text-white/50">Total a receber</p>
                    <p className="font-[family-name:var(--font-bricolage)] text-3xl font-black leading-none text-[#ffb21a]">{formatCurrency(total)}</p>
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div>
                    <div className="flex items-center justify-between">
                        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-white/70">Cliente {requireCustomer ? "(obrigatório)" : "(opcional)"}</p>
                        <button type="button" onClick={onNewCustomer} className="flex h-7 items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 text-[10px] font-bold text-white transition hover:border-orange-400/50">
                            <UserPlus className="size-3" /> Novo cliente
                        </button>
                    </div>
                    <select value={customerId} onChange={(event) => onCustomer(event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-[#123d2b] px-3 text-sm font-semibold text-white outline-none focus:border-[#ffb21a]">
                        <option value="">Consumidor final</option>
                        {customers.filter((customer) => customer.active).map((customer) => (
                            <option key={customer.id} value={customer.id}>{customer.tradeName || customer.name}</option>
                        ))}
                    </select>

                    <label className="mt-3 block">
                        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-white/70">CPF / CNPJ na nota</span>
                        <input
                            type="text"
                            inputMode="numeric"
                            value={customerDocument}
                            onChange={(event) => onCustomerDocument(event.target.value.replace(/\D/g, "").slice(0, 14))}
                            placeholder="Opcional"
                            className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-[#123d2b] px-3 font-mono text-base font-bold tracking-widest text-white outline-none placeholder:font-sans placeholder:text-sm placeholder:font-normal placeholder:tracking-normal placeholder:text-white/40 focus:border-[#ffb21a]"
                        />
                        {customerDocument && <p className="mt-1 font-mono text-[10px] text-white/50">CPF: {formatDocument(customerDocument, "INDIVIDUAL")}</p>}
                    </label>
                </div>

                <div>
                    <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-white/70">Forma de pagamento</p>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                        {PAYMENT_METHODS.map((method) => (
                            <button
                                key={method}
                                type="button"
                                onClick={() => onPaymentMethod(method)}
                                className={`flex h-11 items-center justify-center gap-1.5 rounded-xl border-2 text-xs font-bold transition ${
                                    paymentMethod === method ? "border-[#ffb21a] bg-[#ffb21a]/15 text-[#ffb21a]" : "border-white/10 bg-white/5 text-white/80 hover:bg-white/10"
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
            </div>

            <button type="button" onClick={onPay} className="mt-1 flex h-16 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 font-[family-name:var(--font-bricolage)] text-lg font-black text-white shadow-lg shadow-orange-950/50 transition hover:brightness-110">
                <ChevronRight className="size-5" />Efetuar pagamento — {formatCurrency(total)}
            </button>

            <p className="text-center font-mono text-[10px] text-white/40">
                <CheckCircle2 className="mr-1 inline size-3" />Receba o valor no terminal e confirme na próxima etapa.
            </p>
        </div>
    );
}
