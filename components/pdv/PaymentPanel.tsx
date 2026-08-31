"use client";

import { Banknote, CheckCircle2, ChevronRight, Plus, Trash2, UserPlus, WalletCards } from "lucide-react";

import { formatCurrency, formatDocument, parseCurrency } from "@/lib/format";
import { paymentMethodLabels, type PaymentMethod } from "@/types/sale";
import type { Customer } from "@/types/customer";

const PAYMENT_METHODS: PaymentMethod[] = ["PIX", "CREDIT_CARD", "DEBIT_CARD", "CASH", "BOLETO", "CHECK", "STORE_CREDIT"];
const DEFERRED: PaymentMethod[] = ["CHECK", "STORE_CREDIT"];
const QUICK_AMOUNTS = [1, 5, 10, 20, 50, 100];

export type PaymentPart = { method: PaymentMethod; amount: string };

type PaymentStepProps = {
    customers: Customer[];
    requireCustomer: boolean;
    customerId: string;
    onCustomer: (id: string) => void;
    onNewCustomer: () => void;
    parts: PaymentPart[];
    onPartsChange: (parts: PaymentPart[] | ((prev: PaymentPart[]) => PaymentPart[])) => void;
    dueDate: string;
    onDueDate: (date: string) => void;
    customerDocument: string;
    onCustomerDocument: (value: string) => void;
    total: number;
    onPay: () => void;
    receivedAmount: string;
    onReceivedAmount: (value: string) => void;
};

/** Etapa 3 — cliente, CPF na nota e pagamento (misto, até 2 métodos). */
export default function PaymentStep({
    customers,
    requireCustomer,
    customerId,
    onCustomer,
    onNewCustomer,
    parts,
    onPartsChange,
    dueDate,
    onDueDate,
    customerDocument,
    onCustomerDocument,
    total,
    onPay,
    receivedAmount,
    onReceivedAmount,
}: PaymentStepProps) {
    const isSingle = parts.length === 1;
    const deferred = parts.some((part) => DEFERRED.includes(part.method));
    const isCash = parts.some((part) => part.method === "CASH");
    const cashPartAmount = parts
        .filter((part) => part.method === "CASH")
        .reduce((sum, part) => sum + parseCurrency(part.amount), 0);
    const receivedValue = parseCurrency(receivedAmount);
    const change = receivedValue - cashPartAmount;
    const insufficient = isCash && receivedValue < cashPartAmount;
    const parsedParts = parts.map((part) => ({ method: part.method, amount: parseCurrency(part.amount) }));
    const splitValid =
        isSingle || (parsedParts.every((part) => part.amount > 0) && Math.abs(parsedParts.reduce((sum, part) => sum + part.amount, 0) - total) < 0.01);
    const payDisabled = !splitValid || insufficient;

    function updateAmount(index: number, value: string) {
        onPartsChange((prev) => {
            const next = prev.map((part, i) => (i === index ? { ...part, amount: value } : part));
            if (next.length === 2) {
                const other = 1 - index;
                next[other].amount = Math.max(0, total - parseCurrency(value)).toFixed(2).replace(".", ",");
            }
            return next;
        });
    }

    function updateMethod(index: number, method: PaymentMethod) {
        onPartsChange((prev) => prev.map((part, i) => (i === index ? { ...part, method } : part)));
    }

    function addSecondMethod() {
        onPartsChange((prev) => {
            const half = Math.round((total / 2) * 100) / 100;
            return [
                { ...prev[0], amount: half.toFixed(2).replace(".", ",") },
                { method: "PIX", amount: (Math.round((total - half) * 100) / 100).toFixed(2).replace(".", ",") },
            ];
        });
    }

    function removeSecondMethod() {
        onPartsChange((prev) => [{ method: prev[0].method, amount: "" }]);
    }

    function addQuick(delta: number) {
        onReceivedAmount((receivedValue + delta).toFixed(2).replace(".", ","));
    }

    return (
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 rounded-2xl border-2 border-pdv-line bg-pdv-panel p-6">
            <div className="flex items-center justify-between">
                <h2 className="font-[family-name:var(--font-bricolage)] text-xl font-black text-pdv-fg">Pagamento</h2>
                <p className="font-[family-name:var(--font-bricolage)] text-3xl font-black leading-none text-pdv-gold">{formatCurrency(total)}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
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
                    <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-pdv-fg/70">Forma de pagamento {parts.length > 1 && "(2 métodos)"}</p>

                    {parts.map((part, index) => (
                        <div key={index} className={`mt-2 rounded-xl border border-pdv-line bg-pdv-field p-3 ${parts.length === 1 ? "" : "border-pdv-gold/40"}`}>
                            <div className="flex items-center justify-between gap-2">
                                <span className="font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-pdv-fg/50">{index === 0 ? "1º método" : "2º método"}</span>
                                {index === 1 && (
                                    <button type="button" onClick={removeSecondMethod} aria-label="Remover 2º método" className="flex size-6 items-center justify-center rounded-md text-pdv-fg/50 transition hover:bg-red-500/10 hover:text-red-400">
                                        <Trash2 className="size-3.5" />
                                    </button>
                                )}
                            </div>
                            <div className="mt-1.5 flex gap-2">
                                <select value={part.method} onChange={(event) => updateMethod(index, event.target.value as PaymentMethod)} className="h-11 flex-1 rounded-lg border border-pdv-line bg-pdv-bg px-2 text-xs font-bold text-pdv-fg outline-none focus:border-pdv-gold">
                                    {PAYMENT_METHODS.map((method) => (
                                        <option key={method} value={method}>{paymentMethodLabels[method]}</option>
                                    ))}
                                </select>
                                {isSingle ? (
                                    <div className="flex h-11 shrink-0 items-center justify-center rounded-lg border border-dashed border-pdv-line bg-pdv-bg px-3 font-mono text-sm font-bold text-pdv-fg">
                                        {formatCurrency(total)}
                                    </div>
                                ) : (
                                    <input
                                        type="text"
                                        inputMode="decimal"
                                        value={part.amount}
                                        onChange={(event) => updateAmount(index, event.target.value.replace(/[^\d,.]/g, "").slice(0, 10))}
                                        onFocus={(event) => event.target.select()}
                                        aria-label={`Valor do ${index + 1}º pagamento`}
                                        className="h-11 w-24 shrink-0 rounded-lg border border-pdv-line bg-pdv-bg px-2 text-right font-mono text-sm font-bold text-pdv-fg outline-none focus:border-pdv-gold"
                                    />
                                )}
                            </div>
                        </div>
                    ))}

                    {isSingle && (
                        <button type="button" onClick={addSecondMethod} className="mt-2 flex h-10 w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-pdv-line text-xs font-bold text-pdv-fg/80 transition hover:border-pdv-gold hover:text-pdv-gold">
                            <Plus className="size-3.5" /> Dividir em 2 métodos de pagamento
                        </button>
                    )}
                    {parts.length === 2 && (
                        <button type="button" onClick={addSecondMethod} className="mt-2 flex h-9 w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-pdv-line font-mono text-[10px] font-bold text-pdv-fg/60 transition hover:border-pdv-gold hover:text-pdv-gold">
                            Dividir igualmente (50/50)
                        </button>
                    )}

                    {deferred && (
                        <label className="mt-3 block">
                            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-pdv-fg/70">Vencimento (cheque / fiado)</span>
                            <input type="date" value={dueDate} onChange={(event) => onDueDate(event.target.value)} className="mt-1.5 h-12 w-full rounded-xl border border-pdv-line bg-pdv-field px-3 text-sm font-semibold text-pdv-fg outline-none focus:border-pdv-gold" />
                        </label>
                    )}

                    {isCash && (
                        <div className="mt-3 rounded-xl border border-pdv-line bg-pdv-field p-3">
                            <div className="flex items-center justify-between">
                                <p className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-pdv-fg/70">
                                    <Banknote className="size-3.5 text-pdv-gold" /> Valor recebido
                                </p>
                                <p className="font-mono text-[10px] text-pdv-fg/60">Em dinheiro: <strong className="text-pdv-fg">{formatCurrency(cashPartAmount)}</strong></p>
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
                                <button type="button" onClick={() => onReceivedAmount(cashPartAmount.toFixed(2).replace(".", ","))} className="rounded-lg border border-pdv-line bg-pdv-panel px-2.5 py-1.5 font-mono text-[11px] font-bold text-pdv-fg transition hover:border-pdv-gold">
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
                            {insufficient && <p className="mt-1.5 text-center font-mono text-[10px] text-red-400">Dinheiro recebido menor que a parte em dinheiro — falta {formatCurrency(-change)}.</p>}
                        </div>
                    )}
                </div>
            </div>

            <button
                type="button"
                onClick={onPay}
                disabled={payDisabled}
                className="mt-1 flex h-16 w-full items-center justify-center gap-2 rounded-2xl bg-orange font-[family-name:var(--font-bricolage)] text-lg font-black text-white shadow-lg shadow-orange-950/50 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
            >
                <ChevronRight className="size-5" />Efetuar pagamento — {formatCurrency(total)}
            </button>

            <p className="text-center font-mono text-[10px] text-pdv-fg/40">
                <WalletCards className="mr-1 inline size-3" />
                {parts.length === 2 ? `Dividido em 2: ${parsedParts.map((part) => `${paymentMethodLabels[part.method]} ${part.amount ? formatCurrency(part.amount) : ""}`).join(" + ")}` : "Pague e confirme na próxima etapa."}
            </p>
            {parts.length === 2 && !splitValid && (
                <p className="text-center font-mono text-[10px] text-red-400">
                    <CheckCircle2 className="mr-1 inline size-3" />Os valores dos pagamentos não somam o total ({formatCurrency(total)}).
                </p>
            )}
        </div>
    );
}
