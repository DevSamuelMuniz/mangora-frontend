"use client";

import { Banknote, CheckCircle2, ChevronRight, UserPlus, WalletCards } from "lucide-react";

import { formatCurrency, formatDocument, parseCurrency } from "@/lib/format";
import { paymentMethodLabels, type PaymentMethod } from "@/types/sale";
import type { Customer } from "@/types/customer";

const PAYMENT_METHODS: PaymentMethod[] = ["PIX", "CREDIT_CARD", "DEBIT_CARD", "CASH", "BOLETO", "CHECK", "STORE_CREDIT"];
const DEFERRED: PaymentMethod[] = ["CHECK", "STORE_CREDIT"];
const QUICK_AMOUNTS = [1, 5, 10, 20, 50, 100];

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
    receivedAmount: string;
    onReceivedAmount: (value: string) => void;
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
    receivedAmount,
    onReceivedAmount,
}: PaymentStepProps) {
    const deferred = DEFERRED.includes(paymentMethod);
    const isCash = paymentMethod === "CASH";
    const receivedValue = parseCurrency(receivedAmount);
    const change = receivedValue - total;
    const insufficient = isCash && receivedValue < total;

    function addQuick(delta: number) {
        onReceivedAmount((parseCurrency(receivedAmount) + delta).toFixed(2).replace(".", ","));
    }

    return (
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 rounded-2xl border-2 border-pdv-line bg-pdv-panel p-6">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-orange-400">Etapa 3 de 4</p>
                    <h2 className="font-[family-name:var(--font-bricolage)] text-2xl font-black text-pdv-fg">Pagamento</h2>
                </div>
                <div className="text-right">
                    <p className="font-mono text-[10px] text-pdv-fg/50">Total a receber</p>
                    <p className="font-[family-name:var(--font-bricolage)] text-3xl font-black leading-none text-pdv-gold">{formatCurrency(total)}</p>
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div>
                    <div className="flex items-center justify-between">
                        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-pdv-fg/70">Cliente {requireCustomer ? "(obrigatório)" : "(opcional)"}</p>
                        <button type="button" onClick={onNewCustomer} className="flex h-7 items-center gap-1 rounded-lg border border-pdv-line bg-pdv-line px-2 text-[10px] font-bold text-pdv-fg transition hover:border-orange-400/50">
                            <UserPlus className="size-3" /> Novo cliente
                        </button>
                    </div>
                    <select value={customerId} onChange={(event) => onCustomer(event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-pdv-line bg-pdv-field px-3 text-sm font-semibold text-pdv-fg outline-none focus:border-pdv-gold">
                        <option value="">Consumidor final</option>
                        {customers.filter((customer) => customer.active).map((customer) => (
                            <option key={customer.id} value={customer.id}>{customer.tradeName || customer.name}</option>
                        ))}
                    </select>

                    <label className="mt-3 block">
                        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-pdv-fg/70">CPF / CNPJ na nota</span>
                        <input
                            type="text"
                            inputMode="numeric"
                            value={customerDocument}
                            onChange={(event) => onCustomerDocument(event.target.value.replace(/\D/g, "").slice(0, 14))}
                            placeholder="Opcional"
                            className="mt-2 h-12 w-full rounded-xl border border-pdv-line bg-pdv-field px-3 font-mono text-base font-bold tracking-widest text-pdv-fg outline-none placeholder:font-sans placeholder:text-sm placeholder:font-normal placeholder:tracking-normal placeholder:text-pdv-fg/40 focus:border-pdv-gold"
                        />
                        {customerDocument && <p className="mt-1 font-mono text-[10px] text-pdv-fg/50">CPF: {formatDocument(customerDocument, "INDIVIDUAL")}</p>}
                    </label>
                </div>

                <div>
                    <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-pdv-fg/70">Forma de pagamento</p>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                        {PAYMENT_METHODS.map((method) => (
                            <button
                                key={method}
                                type="button"
                                onClick={() => onPaymentMethod(method)}
                                className={`flex h-11 items-center justify-center gap-1.5 rounded-xl border-2 text-xs font-bold transition ${
                                    paymentMethod === method ? "border-pdv-gold bg-pdv-gold/15 text-pdv-gold" : "border-pdv-line bg-pdv-line text-pdv-fg/80 hover:bg-pdv-line"
                                }`}
                            >
                                <WalletCards className="size-3.5" />{paymentMethodLabels[method]}
                            </button>
                        ))}
                    </div>
                    {deferred && (
                        <label className="mt-3 block">
                            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-pdv-fg/70">Vencimento</span>
                            <input type="date" value={dueDate} onChange={(event) => onDueDate(event.target.value)} className="mt-1.5 h-12 w-full rounded-xl border border-pdv-line bg-pdv-field px-3 text-sm font-semibold text-pdv-fg outline-none focus:border-pdv-gold" />
                        </label>
                    )}

                    {isCash && (
                        <div className="mt-3 rounded-xl border border-pdv-line bg-pdv-field p-3">
                            <div className="flex items-center justify-between">
                                <p className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-pdv-fg/70">
                                    <Banknote className="size-3.5 text-pdv-gold" /> Valor recebido
                                </p>
                                <p className="font-mono text-[10px] text-pdv-fg/60">Total: <strong className="text-pdv-fg">{formatCurrency(total)}</strong></p>
                            </div>
                            <input
                                type="text"
                                inputMode="decimal"
                                value={receivedAmount}
                                onChange={(event) => onReceivedAmount(event.target.value.replace(/[^\d,.]/g, "").slice(0, 10))}
                                onFocus={(event) => event.target.select()}
                                placeholder="0,00"
                                aria-label="Valor recebido em dinheiro"
                                className={`mt-2 h-14 w-full rounded-xl border bg-pdv-bg px-3 text-right font-mono text-2xl font-black tracking-wide outline-none placeholder:text-pdv-fg/30 ${insufficient ? "border-red-400/60 text-red-400" : "border-pdv-line text-pdv-fg focus:border-pdv-gold"}`}
                            />
                            <div className="mt-2 flex flex-wrap gap-1.5">
                                <button type="button" onClick={() => onReceivedAmount(total.toFixed(2).replace(".", ","))} className="rounded-lg border border-pdv-line bg-pdv-panel px-2.5 py-1.5 font-mono text-[11px] font-bold text-pdv-fg transition hover:border-pdv-gold">
                                    Exato
                                </button>
                                {QUICK_AMOUNTS.map((amount) => (
                                    <button key={amount} type="button" onClick={() => addQuick(amount)} className="rounded-lg border border-pdv-line bg-pdv-panel px-2.5 py-1.5 font-mono text-[11px] font-bold text-pdv-fg transition hover:border-pdv-gold">
                                        +R${amount}
                                    </button>
                                ))}
                            </div>
                            <div className={`mt-3 flex items-center justify-between rounded-lg px-3 py-2 ${change >= 0 ? "bg-pdv-ok/10" : "bg-red-500/10"}`}>
                                <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-pdv-fg/70">Troco</span>
                                <strong className={`font-[family-name:var(--font-bricolage)] text-2xl font-black leading-none ${change >= 0 ? "text-pdv-ok" : "text-red-400"}`}>
                                    {receivedAmount ? formatCurrency(Math.max(0, change)) : "—"}
                                </strong>
                            </div>
                            {insufficient && <p className="mt-1.5 text-center font-mono text-[10px] text-red-400">Valor recebido menor que o total — falta {formatCurrency(-change)}.</p>}
                        </div>
                    )}
                </div>
            </div>

            <button
                type="button"
                onClick={onPay}
                disabled={insufficient}
                className="mt-1 flex h-16 w-full items-center justify-center gap-2 rounded-2xl bg-orange font-[family-name:var(--font-bricolage)] text-lg font-black text-white shadow-lg shadow-orange-950/50 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
            >
                <ChevronRight className="size-5" />Efetuar pagamento — {formatCurrency(total)}
            </button>

            <p className="text-center font-mono text-[10px] text-pdv-fg/40">
                <CheckCircle2 className="mr-1 inline size-3" />Receba o valor no terminal e confirme na próxima etapa.
            </p>
        </div>
    );
}
