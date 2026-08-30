"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
    ArrowLeft,
    Barcode,
    CheckCircle2,
    ChevronRight,
    LoaderCircle,
    Minus,
    Plus,
    ScanLine,
    ShoppingCart,
    Store,
    Trash2,
    WalletCards,
    X,
} from "lucide-react";

import { useCashRegister } from "@/features/cash-registers/hooks/useCashRegister";
import { useCompanySettings } from "@/features/settings/hooks/useSettings";
import { useCreateSale, useSaleOptions } from "@/features/sales/hooks/useSales";
import { formatCurrency } from "@/lib/format";
import { paymentMethodLabels, type PaymentMethod } from "@/types/sale";
import type { AuthSession } from "@/lib/auth/types";
import type { Product } from "@/types/product";

type CartItem = { product: Product; quantity: number };

const PAYMENT_METHODS: PaymentMethod[] = ["PIX", "CREDIT_CARD", "DEBIT_CARD", "CASH", "BOLETO", "CHECK", "STORE_CREDIT"];
const DEFERRED: PaymentMethod[] = ["CHECK", "STORE_CREDIT"];

export default function PdvScreen({ session }: { session: AuthSession }) {
    const { data: options, isLoading: loadingOptions } = useSaleOptions();
    const createSale = useCreateSale();
    const { data: registerOverview } = useCashRegister();
    const register = registerOverview?.register ?? null;
    const { data: company } = useCompanySettings();

    const products = useMemo(() => options?.products ?? [], [options]);
    const customers = useMemo(() => options?.customers ?? [], [options]);

    const [cart, setCart] = useState<CartItem[]>([]);
    const [scanInput, setScanInput] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [customerId, setCustomerId] = useState("");
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(company?.defaultPayment ?? "PIX");
    const [dueDate, setDueDate] = useState(() => {
        const value = new Date();
        value.setDate(value.getDate() + 1);
        return value.toISOString().slice(0, 10);
    });
    const [discount, setDiscount] = useState("0");
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const scanRef = useRef<HTMLInputElement>(null);

    // Mantém o campo de scan sempre focado (leitor de código de barras).
    const keepScanFocus = useCallback(() => {
        scanRef.current?.focus();
    }, []);
    useEffect(() => {
        keepScanFocus();
        const onKey = (event: KeyboardEvent) => {
            if ((event.key === "/" || event.key === "F2") && document.activeElement !== scanRef.current) {
                event.preventDefault();
                keepScanFocus();
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [keepScanFocus]);

    // Avisos temporários somem sozinhos.
    useEffect(() => {
        if (!notice) return;
        const timer = setTimeout(() => setNotice(""), 4000);
        return () => clearTimeout(timer);
    }, [notice]);

    const availableProducts = useMemo(() => {
        const query = searchTerm.trim().toLocaleLowerCase("pt-BR");
        return products
            .filter((product) => product.active && (!product.trackStock || product.stock - product.reservedStock > 0))
            .filter(
                (product) =>
                    !query ||
                    `${product.name} ${product.sku ?? ""} ${product.barcode ?? ""}`.toLocaleLowerCase("pt-BR").includes(query),
            )
            .slice(0, 40);
    }, [products, searchTerm]);

    const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const discountValue = Math.max(0, Math.min(Number(discount) || 0, company?.maximumDiscount ?? 100));
    const total = Math.max(0, subtotal - discountValue);
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    function addProduct(product: Product) {
        setError("");
        setCart((current) => {
            const existing = current.find((item) => item.product.id === product.id);
            if (!existing) return [...current, { product, quantity: 1 }];
            const available = product.stock - product.reservedStock;
            if (product.trackStock && existing.quantity >= available) return current;
            return current.map((item) => (item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
        });
        keepScanFocus();
    }

    function changeQuantity(productId: string, delta: number) {
        setCart((current) =>
            current.flatMap((item) => {
                if (item.product.id !== productId) return [item];
                const next = item.quantity + delta;
                if (next <= 0) return [];
                if (item.product.trackStock && next > item.product.stock - item.product.reservedStock) return [item];
                return [{ ...item, quantity: next }];
            }),
        );
    }

    /** Entrada do leitor de código de barras (digita + Enter) ou busca rápida. */
    function handleScan() {
        const value = scanInput.trim();
        if (!value) return;
        const exact = products.find((product) => product.barcode && product.barcode === value);
        if (exact) {
            addProduct(exact);
            setScanInput("");
        } else {
            setSearchTerm(value);
        }
    }

    function finishSale() {
        if (!cart.length) return setError("Adicione pelo menos um item.");
        if (company?.requireCustomer && !customerId) return setError("Esta empresa exige cliente identificado.");
        if (DEFERRED.includes(paymentMethod) && !customerId) return setError("Cheque/fiado exige cliente.");
        if (DEFERRED.includes(paymentMethod) && !dueDate) return setError("Informe o vencimento.");

        setError("");
        void createSale
            .mutateAsync({
                customerId: customerId || undefined,
                paymentMethod,
                dueDate: DEFERRED.includes(paymentMethod) ? dueDate : undefined,
                discount: discountValue,
                items: cart.map((item) => ({ productId: item.product.id, quantity: item.quantity })),
            })
            .then((sale) => {
                setNotice(`Venda ${sale.code} registrada — total ${formatCurrency(sale.total)}`);
                setCart([]);
                setCustomerId("");
                setDiscount("0");
                setSearchTerm("");
                setScanInput("");
                setPaymentMethod(company?.defaultPayment ?? "PIX");
                keepScanFocus();
            })
            .catch((cause: unknown) => setError(cause instanceof Error ? cause.message : "Não foi possível concluir a venda."));
    }

    return (
        <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100" onKeyDown={(event) => {
            if (event.key === "F4" && !(event.target instanceof HTMLInputElement)) {
                event.preventDefault();
                finishSale();
            }
        }}>
            {/* Cabeçalho: empresa atual, caixa, relógio e ações */}
            <header className="flex items-center justify-between gap-4 border-b border-white/10 bg-slate-900 px-5 py-3">
                <div className="flex min-w-0 items-center gap-4">
                    <Link href="/vendas" aria-label="Voltar para vendas" className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white">
                        <ArrowLeft className="size-4" />
                    </Link>
                    <div className="min-w-0">
                        <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-orange-400">
                            <Store className="size-3.5" /> {company?.tradeName ?? session.company.tradeName}
                            {company?.city && company.state && <span className="text-slate-500">· {company.city} - {company.state}</span>}
                        </p>
                        <h1 className="truncate text-lg font-black tracking-tight text-white">PDV — Ponto de Venda</h1>
                    </div>
                </div>

                <div className="hidden items-center gap-3 md:flex">
                    <div className="rounded-xl bg-white/5 px-4 py-2 text-right">
                        <p className="text-[10px] text-slate-400">{new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })}</p>
                        <p className="text-sm font-black text-white">{new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</p>
                    </div>
                    <div className={`rounded-xl px-4 py-2 text-right ${register?.status === "OPEN" ? "bg-green-500/15 text-green-300" : "bg-amber-500/15 text-amber-300"}`}>
                        <p className="text-[10px] text-slate-400">Caixa</p>
                        <p className="text-sm font-black">
                            {register?.status === "OPEN" ? `Aberto por ${register.openedByName}` : "Fechado"}
                        </p>
                    </div>
                </div>
            </header>

            {/* Corpo */}
            <div className="grid flex-1 gap-4 p-4 lg:grid-cols-[1fr_380px]">
                {/* Coluna esquerda: busca/scan + produtos */}
                <section className="flex flex-col gap-4">
                    <div className="relative">
                        <ScanLine className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-orange-400" />
                        <input
                            ref={scanRef}
                            value={scanInput}
                            onChange={(event) => setScanInput(event.target.value)}
                            onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                    event.preventDefault();
                                    handleScan();
                                }
                            }}
                            onBlur={() => setTimeout(keepScanFocus, 50)}
                            placeholder="Leia o código de barras ou busque por nome / SKU e pressione Enter (F2 ou / para focar)"
                            className="h-14 w-full rounded-2xl border border-white/10 bg-slate-900 pl-14 pr-4 text-base font-semibold text-white outline-none placeholder:text-slate-500 focus:border-orange-400 focus:ring-4 focus:ring-orange-400/20"
                        />
                        {scanInput && (
                            <button type="button" onClick={() => { setScanInput(""); setSearchTerm(""); keepScanFocus(); }} aria-label="Limpar busca" className="absolute right-3 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 hover:bg-white/5 hover:text-white">
                                <X className="size-4" />
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-3 overflow-y-auto xl:grid-cols-3" style={{ maxHeight: "calc(100vh - 15rem)" }}>
                        {loadingOptions ? (
                            <div className="col-span-full flex min-h-64 items-center justify-center text-slate-400">
                                <LoaderCircle className="mr-2 size-5 animate-spin text-orange-400" /> Carregando produtos...
                            </div>
                        ) : availableProducts.length ? (
                            availableProducts.map((product) => {
                                const available = product.stock - product.reservedStock;
                                const inCart = cart.find((item) => item.product.id === product.id)?.quantity ?? 0;
                                return (
                                    <button
                                        key={product.id}
                                        type="button"
                                        onClick={() => addProduct(product)}
                                        className="group flex flex-col rounded-2xl border border-white/10 bg-slate-900 p-4 text-left transition hover:border-orange-400/60 hover:bg-slate-800"
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <p className="truncate text-sm font-bold text-white">{product.name}</p>
                                            {inCart > 0 && (
                                                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-orange-500 text-[11px] font-black text-white">{inCart}</span>
                                            )}
                                        </div>
                                        <p className="mt-0.5 text-[10px] text-slate-500">{product.sku ?? "—"}</p>
                                        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
                                            <strong className="text-lg font-black text-white">{formatCurrency(product.price)}</strong>
                                            <span className={`text-[10px] font-bold ${product.trackStock ? (available <= product.minimumStock ? "text-amber-400" : "text-slate-500") : "text-slate-500"}`}>
                                                {product.trackStock ? `${available} disp.` : "Serviço"}
                                            </span>
                                        </div>
                                    </button>
                                );
                            })
                        ) : (
                            <div className="col-span-full flex min-h-64 flex-col items-center justify-center text-slate-500">
                                <Barcode className="mb-3 size-8 text-slate-700" />
                                <p className="text-sm font-bold text-slate-300">Nenhum produto encontrado</p>
                                <p className="mt-1 text-xs">Aponte o leitor ou digite o código de barras.</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Coluna direita: carrinho + pagamento */}
                <aside className="flex flex-col gap-4">
                    <div className="rounded-2xl border border-white/10 bg-slate-900 p-4">
                        <div className="flex items-center justify-between">
                            <h2 className="flex items-center gap-2 text-sm font-black text-white">
                                <ShoppingCart className="size-4 text-orange-400" /> Carrinho
                            </h2>
                            <span className="rounded-full bg-white/5 px-2.5 py-1 text-[10px] font-bold text-slate-300">{itemCount} item(ns)</span>
                        </div>

                        <div className="mt-3 max-h-56 space-y-2 overflow-y-auto">
                            {cart.length ? (
                                cart.map(({ product, quantity }) => (
                                    <div key={product.id} className="flex items-center gap-3 rounded-xl bg-white/5 p-2.5">
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-xs font-bold text-white">{product.name}</p>
                                            <p className="text-[10px] text-slate-400">{formatCurrency(product.price)} × {quantity}</p>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button type="button" onClick={() => changeQuantity(product.id, -1)} aria-label={`Diminuir ${product.name}`} className="flex size-7 items-center justify-center rounded-lg bg-white/5 text-slate-300 hover:bg-white/10">
                                                <Minus className="size-3.5" />
                                            </button>
                                            <span className="w-7 text-center text-xs font-black text-white">{quantity}</span>
                                            <button type="button" onClick={() => changeQuantity(product.id, 1)} aria-label={`Aumentar ${product.name}`} className="flex size-7 items-center justify-center rounded-lg bg-white/5 text-slate-300 hover:bg-white/10">
                                                <Plus className="size-3.5" />
                                            </button>
                                        </div>
                                        <button type="button" onClick={() => changeQuantity(product.id, -999)} aria-label={`Remover ${product.name}`} className="flex size-7 items-center justify-center rounded-lg text-slate-500 hover:bg-red-500/10 hover:text-red-400">
                                            <Trash2 className="size-3.5" />
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <p className="py-6 text-center text-xs text-slate-500">Leia um produto para começar.</p>
                            )}
                        </div>

                        <div className="mt-3 space-y-1.5 border-t border-white/10 pt-3 text-xs">
                            <div className="flex justify-between text-slate-400"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
                            <div className="flex items-center justify-between text-slate-400">
                                <span>Desconto (máx. {company?.maximumDiscount ?? 0}%)</span>
                                <input
                                    type="number"
                                    min={0}
                                    max={company?.maximumDiscount ?? 100}
                                    step="0.5"
                                    value={discount}
                                    onChange={(event) => setDiscount(event.target.value)}
                                    className="h-8 w-20 rounded-lg border border-white/10 bg-slate-950 px-2 text-right text-xs font-bold text-white outline-none focus:border-orange-400"
                                />
                            </div>
                            <div className="flex justify-between border-t border-white/10 pt-2 text-sm font-black text-white">
                                <span>Total</span><span className="text-xl text-orange-400">{formatCurrency(total)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-slate-900 p-4">
                        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Cliente (opcional{company?.requireCustomer ? " — obrigatório" : ""})</p>
                        <select value={customerId} onChange={(event) => setCustomerId(event.target.value)} className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-slate-950 px-3 text-sm font-semibold text-white outline-none focus:border-orange-400">
                            <option value="">Consumidor final</option>
                            {customers.filter((customer) => customer.active).map((customer) => (
                                <option key={customer.id} value={customer.id}>{customer.tradeName || customer.name}</option>
                            ))}
                        </select>

                        <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Pagamento</p>
                        <div className="mt-2 grid grid-cols-2 gap-2">
                            {PAYMENT_METHODS.map((method) => (
                                <button
                                    key={method}
                                    type="button"
                                    onClick={() => setPaymentMethod(method)}
                                    className={`flex h-10 items-center justify-center gap-1.5 rounded-xl border text-xs font-bold transition ${
                                        paymentMethod === method ? "border-orange-400 bg-orange-500/20 text-orange-300" : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                                    }`}
                                >
                                    <WalletCards className="size-3.5" />{paymentMethodLabels[method]}
                                </button>
                            ))}
                        </div>

                        {DEFERRED.includes(paymentMethod) && (
                            <label className="mt-3 block">
                                <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Vencimento</span>
                                <input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-white/10 bg-slate-950 px-3 text-sm font-semibold text-white outline-none focus:border-orange-400" />
                            </label>
                        )}

                        {error && <p role="alert" className="mt-3 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-300">{error}</p>}
                        {notice && <p role="status" className="mt-3 flex items-center gap-2 rounded-xl border border-green-500/30 bg-green-500/10 px-3 py-2 text-xs font-semibold text-green-300"><CheckCircle2 className="size-4 shrink-0" />{notice}</p>}

                        <button type="button" onClick={finishSale} disabled={createSale.isPending || !cart.length} className="mt-4 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 px-4 text-base font-black text-white shadow-lg shadow-orange-950/40 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50">
                            {createSale.isPending ? <><LoaderCircle className="size-5 animate-spin" />Finalizando...</> : <><ChevronRight className="size-5" />Finalizar venda — {formatCurrency(total)}</>}
                        </button>
                    </div>
                </aside>
            </div>

            {/* Barra de atalhos */}
            <footer className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 border-t border-white/10 bg-slate-900 px-4 py-2 text-[10px] font-semibold text-slate-500">
                <Kbd>F2</Kbd> ou <Kbd>/</Kbd> focar busca · <Kbd>Enter</Kbd> confirmar leitura · <Kbd>F4</Kbd> finalizar venda · <Kbd>+</Kbd>/<Kbd>−</Kbd> quantidade · <Kbd>Esc</Kbd> limpar
            </footer>
        </div>
    );
}

function Kbd({ children }: { children: ReactNode }) {
    return <kbd className="rounded-md border border-white/15 bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-slate-300">{children}</kbd>;
}
