"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, LoaderCircle, ShieldCheck } from "lucide-react";

import { useCreateSale, useSaleOptions } from "@/features/sales/hooks/useSales";
import { useCompanySettings } from "@/features/settings/hooks/useSettings";
import { useToast } from "@/components/ui/toast";
import { formatCurrency, parseCurrency } from "@/lib/format";
import type { PaymentMethod, Sale } from "@/types/sale";
import type { Customer } from "@/types/customer";
import type { AuthSession } from "@/lib/auth/types";

import PdvHeader, { type PdvTheme } from "./PdvHeader";
import ScanBar from "./ScanBar";
import ProductGrid from "./ProductGrid";
import CartPanel, { type CartItem } from "./CartPanel";
import PaymentStep from "./PaymentPanel";
import ReviewItems from "./ReviewItems";
import DoneStep from "./DoneStep";
import SalePreview from "./SalePreview";
import NewCustomerModal from "./NewCustomerModal";

type Step = "items" | "review" | "payment" | "processing" | "done";
type PaymentPart = { method: PaymentMethod; amount: string };
const DEFERRED: PaymentMethod[] = ["CHECK", "STORE_CREDIT"];

export default function PdvScreen({ session }: { session: AuthSession }) {
    const { data: options, isLoading: loadingOptions } = useSaleOptions();
    const createSale = useCreateSale();
    const toast = useToast();
    const { data: company } = useCompanySettings();

    const products = useMemo(() => options?.products ?? [], [options]);
    const customers = useMemo(() => options?.customers ?? [], [options]);

    const [step, setStep] = useState<Step>("items");
    const [theme, setTheme] = useState<PdvTheme>(() => {
        try {
            const saved = typeof window !== "undefined" ? window.localStorage.getItem("pdv-theme") : null;
            return saved === "dark" || saved === "verde" || saved === "light" ? saved : "dark";
        } catch {
            return "dark";
        }
    });
    const changeTheme = useCallback((next: PdvTheme) => {
        setTheme(next);
        try {
            window.localStorage.setItem("pdv-theme", next);
        } catch {
            // armazenamento indisponível: tema vale só para esta sessão
        }
    }, []);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [scanInput, setScanInput] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [category, setCategory] = useState("Todos");
    const [customerId, setCustomerId] = useState("");
    const [parts, setParts] = useState<PaymentPart[]>([{ method: company?.defaultPayment ?? "PIX", amount: "" }]);
    const [dueDate, setDueDate] = useState(() => {
        const value = new Date();
        value.setDate(value.getDate() + 1);
        return value.toISOString().slice(0, 10);
    });
    const [discount, setDiscount] = useState("0");
    const [customerDocument, setCustomerDocument] = useState("");
    const [receivedAmount, setReceivedAmount] = useState("");
    const [newCustomerOpen, setNewCustomerOpen] = useState(false);
    const [quickCustomers, setQuickCustomers] = useState<Customer[]>([]);
    const [saleResult, setSaleResult] = useState<Sale | null>(null);
    const scanRef = useRef<HTMLInputElement>(null);

    // Campo de scan sempre focado (leitor de código de barras), só na etapa de itens.
    const keepScanFocus = useCallback(() => {
        scanRef.current?.focus();
    }, []);
    useEffect(() => {
        if (step !== "items") return;
        keepScanFocus();
        const onKey = (event: KeyboardEvent) => {
            if ((event.key === "/" || event.key === "F2") && document.activeElement !== scanRef.current) {
                event.preventDefault();
                keepScanFocus();
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [step, keepScanFocus]);

    // Adiciona o produto automaticamente assim que o código de barras completo é lido
    // (o leitor digita o código caractere a caractere; no último caractere há o match).
    function handleScanInput(value: string) {
        setScanInput(value);
        const exact = products.find((product) => product.barcode && product.barcode === value.trim());
        if (exact) {
            addProduct(exact);
            setScanInput("");
        }
    }

    const availableProducts = useMemo(() => {
        const query = searchTerm.trim().toLocaleLowerCase("pt-BR");
        return products
            .filter((product) => product.active && (!product.trackStock || product.stock - product.reservedStock > 0))
            .filter((product) => category === "Todos" || product.category === category)
            .filter(
                (product) =>
                    !query ||
                    `${product.name} ${product.sku ?? ""} ${product.barcode ?? ""}`.toLocaleLowerCase("pt-BR").includes(query),
            )
            .slice(0, 40);
    }, [products, searchTerm, category]);

    const categories = useMemo(() => ["Todos", ...new Set(products.map((product) => product.category))], [products]);

    const cartCounts = useMemo(
        () => Object.fromEntries(cart.map((item) => [item.product.id, item.quantity])) as Record<string, number>,
        [cart],
    );
    const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const discountValue = Math.max(0, Math.min(Number(discount) || 0, company?.maximumDiscount ?? 100));
    const total = Math.max(0, subtotal - discountValue);
    const receivedValue = parseCurrency(receivedAmount);
    const primaryMethod = parts[0]?.method ?? "PIX";
    const deferred = parts.some((part) => DEFERRED.includes(part.method));
    const isCash = parts.some((part) => part.method === "CASH");
    // Parte única = total (o valor fica travado na tela); parte em divisão = valor digitado.
    const partAmount = (part: PaymentPart) => (parts.length === 1 ? total : parseCurrency(part.amount));
    const parsedParts = parts.map((part) => ({ method: part.method, amount: partAmount(part) }));
    const cashPartAmount = parsedParts
        .filter((part) => part.method === "CASH")
        .reduce((sum, part) => sum + part.amount, 0);
    const splitValid =
        parts.length === 1 || (parsedParts.every((part) => part.amount > 0) && Math.abs(parsedParts.reduce((sum, part) => sum + part.amount, 0) - total) < 0.01);
    const cashChange = isCash ? { received: receivedValue, change: Math.max(0, receivedValue - cashPartAmount) } : undefined;
    const selectedCustomer = customers.find((customer) => customer.id === customerId);
    const selectedCustomerName = selectedCustomer ? selectedCustomer.tradeName || selectedCustomer.name : "Consumidor final";
    // Clientes cadastrados no terminal aparecem no dropdown imediatamente
    // (antes mesmo do refetch da query ["sale-options"]).
    const dropdownCustomers = useMemo(() => {
        const known = new Set(customers.map((customer) => customer.id));
        return [...quickCustomers.filter((customer) => !known.has(customer.id)), ...customers];
    }, [customers, quickCustomers]);

    function addProduct(product: import("@/types/product").Product) {
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

    /** Etapa 1 → 2: validar o carrinho e ir para a revisão dos itens. */
    function goToReview() {
        if (!cart.length) return toast.error("Adicione pelo menos um item ao carrinho.");
        setStep("review");
    }

    /** Etapa 2 → 3: confirmar itens e ir para o pagamento. */
    function goToPayment() {
        setStep("payment");
    }

    /** Etapa 3 → 4: pagamento efetuado — aguardando confirmação final. */
    function pay() {
        if (company?.requireCustomer && !customerId) return toast.error("Esta empresa exige cliente identificado.");
        if (deferred && !customerId) return toast.error("Cheque ou fiado exige cliente.");
        if (deferred && !dueDate) return toast.error("Informe o vencimento do pagamento.");
        if (!splitValid) return toast.error("Os valores dos pagamentos não somam o total da venda.");
        setStep("processing");
    }

    /** Etapa 4 → 5: confirmação final — envia a venda. */
    function confirmPayment() {
        const paymentParts = parsedParts
            .filter((part) => part.amount > 0)
            .map((part) => ({ method: part.method, amount: Math.round(part.amount * 100) / 100 }));
        void createSale
            .mutateAsync({
                customerId: customerId || undefined,
                customerDocument: customerDocument || undefined,
                paymentMethod: primaryMethod,
                payments: paymentParts.length ? paymentParts : [{ method: primaryMethod, amount: Math.round(total * 100) / 100 }],
                dueDate: deferred ? dueDate : undefined,
                discount: discountValue,
                items: cart.map((item) => ({ productId: item.product.id, quantity: item.quantity })),
            })
            .then((sale) => {
                setSaleResult(sale);
                setStep("done");
            })
            .catch((cause: unknown) => toast.error(cause instanceof Error ? cause.message : "Não foi possível concluir a venda."));
    }

    /** Etapa 5 → nova venda. */
    function resetSale() {
        setCart([]);
        setCustomerId("");
        setDiscount("0");
        setSearchTerm("");
        setScanInput("");
        setCustomerDocument("");
        setReceivedAmount("");
        setParts([{ method: company?.defaultPayment ?? "PIX", amount: "" }]);
        setSaleResult(null);
        setStep("items");
        keepScanFocus();
    }

    return (
        <div
            data-theme={theme}
            className="flex min-h-screen flex-col bg-pdv-bg font-[family-name:var(--font-manrope)] text-pdv-fg"
            onKeyDown={(event) => {
                if (event.key === "F4" && !(event.target instanceof HTMLInputElement)) {
                    event.preventDefault();
                    if (step === "items") goToReview();
                }
            }}
        >
            <PdvHeader session={session} theme={theme} onThemeChange={changeTheme} />

            <div className="flex flex-1 items-start justify-center p-4 lg:p-6">
                {step === "items" && (
                    <div className="grid w-full max-w-6xl flex-1 gap-4 lg:grid-cols-[1fr_400px]">
                        <section className="flex flex-col gap-4">
                            <ScanBar value={scanInput} onChange={handleScanInput} onEnter={handleScan} onClear={() => { setScanInput(""); setSearchTerm(""); keepScanFocus(); }} onBlurRefocus={keepScanFocus} ref={scanRef} />
                            <div className="flex items-center justify-between">
                                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-pdv-fg/60">
                                    {searchTerm ? `Resultados para "${searchTerm}"` : "Catálogo disponível"}
                                </p>
                                <span className="rounded-full bg-pdv-line px-2.5 py-1 font-mono text-[10px] font-bold text-pdv-fg/60">{availableProducts.length} produto(s)</span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {categories.map((item) => (
                                    <button
                                        key={item}
                                        type="button"
                                        onClick={() => setCategory(item)}
                                        className={`rounded-full px-3 py-1.5 font-mono text-[11px] font-bold transition ${
                                            category === item ? "bg-pdv-gold text-ink" : "bg-pdv-line text-pdv-fg/60 hover:bg-pdv-line"
                                        }`}
                                    >
                                        {item}
                                    </button>
                                ))}
                            </div>
                            <ProductGrid products={availableProducts} loading={loadingOptions} cartCounts={cartCounts} onAdd={addProduct} onChangeQuantity={changeQuantity} />
                        </section>
                        <aside className="flex flex-col gap-4">
                            <CartPanel
                                cart={cart}
                                subtotal={subtotal}
                                discountValue={discountValue}
                                maxDiscount={company?.maximumDiscount ?? 100}
                                total={total}
                                onQuantity={changeQuantity}
                                onDiscount={setDiscount}
                            />
                            <button type="button" onClick={goToReview} disabled={!cart.length} className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-orange font-[family-name:var(--font-bricolage)] text-base font-black text-white shadow-lg shadow-orange-950/50 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40">
                                Confirmar itens — {formatCurrency(total)}
                            </button>
                            <p className="text-center font-mono text-[10px] text-pdv-fg/40">Após confirmar, você escolhe o pagamento e finaliza.</p>
                        </aside>
                    </div>
                )}

                {step === "review" && (
                    <div className="grid w-full max-w-6xl gap-6 lg:grid-cols-[1fr_340px]">
                        <div className="flex justify-center">
                            <ReviewItems cart={cart} subtotal={subtotal} discount={discountValue} total={total} onBack={() => setStep("items")} onNext={goToPayment} />
                        </div>
                        <SalePreview cart={cart} subtotal={subtotal} discount={discountValue} total={total} customerName={selectedCustomerName} payments={parsedParts} customerDocument={customerDocument || undefined} />
                    </div>
                )}

                {step === "payment" && (
                    <div className="grid w-full max-w-6xl gap-6 lg:grid-cols-[1fr_340px]">
                        <div className="flex justify-center">
                            <PaymentStep
                                customers={dropdownCustomers}
                                requireCustomer={Boolean(company?.requireCustomer)}
                                customerId={customerId}
                                onCustomer={setCustomerId}
                                onNewCustomer={() => setNewCustomerOpen(true)}
                                parts={parts}
                                onPartsChange={setParts}
                                dueDate={dueDate}
                                onDueDate={setDueDate}
                                customerDocument={customerDocument}
                                onCustomerDocument={setCustomerDocument}
                                total={total}
                                onPay={pay}
                                receivedAmount={receivedAmount}
                                onReceivedAmount={setReceivedAmount}
                            />
                        </div>
                        <SalePreview cart={cart} subtotal={subtotal} discount={discountValue} total={total} customerName={selectedCustomerName} payments={parsedParts} customerDocument={customerDocument || undefined} received={cashChange?.received} change={cashChange?.change} />
                    </div>
                )}

                {step === "processing" && (
                    <div className="grid w-full max-w-6xl gap-6 lg:grid-cols-[1fr_340px]">
                        <div className="flex justify-center">
                            <div className="mx-auto flex w-full max-w-md flex-col items-center rounded-2xl border-2 border-pdv-line bg-pdv-panel p-8 text-center">
                                <span className="flex size-16 items-center justify-center rounded-full bg-pdv-gold/15 text-pdv-gold">
                                    <ShieldCheck className="size-8" />
                                </span>
                                <h2 className="mt-4 font-[family-name:var(--font-bricolage)] text-2xl font-black text-pdv-fg">Pagamento efetuado?</h2>
                                <p className="mt-2 max-w-xs text-sm leading-6 text-pdv-fg/60">
                                    Confirme que o pagamento de <strong className="text-pdv-gold">{formatCurrency(total)}</strong> foi recebido
                                    ({parsedParts.map((part) => `${paymentMethodLabelsSafe(part.method)}${part.amount ? ` ${formatCurrency(part.amount)}` : ""}`).join(" + ")}).
                                </p>
                                {cashChange && (
                                    <div className="mt-4 w-full rounded-xl bg-pdv-ok/10 px-4 py-3 font-mono text-sm">
                                        <div className="flex justify-between text-pdv-fg/70"><span>Valor recebido</span><span>{formatCurrency(cashChange.received)}</span></div>
                                        <div className="mt-1 flex justify-between font-bold text-pdv-ok"><span>Troco a devolver</span><span>{formatCurrency(cashChange.change)}</span></div>
                                    </div>
                                )}
                                {createSale.isPending && (
                                    <p className="mt-4 flex items-center gap-2 font-mono text-xs text-pdv-fg/50"><LoaderCircle className="size-4 animate-spin" />Finalizando venda...</p>
                                )}
                                <div className="mt-6 grid w-full grid-cols-2 gap-2">
                                    <button type="button" onClick={() => setStep("payment")} disabled={createSale.isPending} className="flex h-14 items-center justify-center gap-2 rounded-xl border border-pdv-line text-sm font-bold text-pdv-fg/70 transition hover:bg-pdv-line disabled:opacity-50">
                                        <ArrowLeft className="size-4" /> Voltar
                                    </button>
                                    <button type="button" onClick={confirmPayment} disabled={createSale.isPending} className="flex h-14 items-center justify-center gap-2 rounded-xl bg-orange font-[family-name:var(--font-bricolage)] text-sm font-black text-white transition hover:brightness-110 disabled:opacity-60">
                                        {createSale.isPending ? <><LoaderCircle className="size-4 animate-spin" />Finalizando...</> : <>Confirmar pagamento</>}
                                    </button>
                                </div>
                            </div>
                        </div>
                        <SalePreview cart={cart} subtotal={subtotal} discount={discountValue} total={total} customerName={selectedCustomerName} payments={parsedParts} customerDocument={customerDocument || undefined} received={cashChange?.received} change={cashChange?.change} />
                    </div>
                )}

                {step === "done" && saleResult && (
                    <DoneStep sale={saleResult} company={company ?? null} received={cashChange?.received} change={cashChange?.change} onFinish={resetSale} />
                )}
            </div>

            <footer className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 border-t border-pdv-line bg-pdv-panel px-4 py-2 font-mono text-[10px] font-semibold text-pdv-fg/60">
                {step === "items" ? (
                    <><Kbd>F2</Kbd> ou <Kbd>/</Kbd> focar busca · <Kbd>Enter</Kbd> confirmar leitura · <Kbd>F4</Kbd> confirmar itens · <Kbd>+</Kbd>/<Kbd>−</Kbd> quantidade · <Kbd>⛶</Kbd> tela cheia</>
                ) : (
                    <><Kbd>Etapa {stepIndex(step)} de 4</Kbd> · {stepLabel(step)}</>
                )}
            </footer>

            {newCustomerOpen && (
                <NewCustomerModal onCreated={(customer) => { setQuickCustomers((prev) => [...prev, customer]); setCustomerId(customer.id); setNewCustomerOpen(false); }} onClose={() => setNewCustomerOpen(false)} />
            )}
        </div>
    );
}

function Kbd({ children }: { children: import("react").ReactNode }) {
    return <kbd className="rounded-md border border-pdv-line bg-pdv-line px-1.5 py-0.5 text-[10px] text-pdv-fg">{children}</kbd>;
}

function paymentMethodLabelsSafe(method: PaymentMethod): string {
    return ({ PIX: "PIX", CREDIT_CARD: "cartão de crédito", DEBIT_CARD: "cartão de débito", CASH: "dinheiro", BOLETO: "boleto", CHECK: "cheque", STORE_CREDIT: "fiado" })[method] ?? method;
}

function stepIndex(step: Step): number {
    return ({ items: 1, review: 2, payment: 3, processing: 4, done: 5 })[step] ?? 1;
}

function stepLabel(step: Step): string {
    return ({ items: "Itens", review: "Revisão", payment: "Pagamento", processing: "Confirmação", done: "Finalizada" })[step] ?? step;
}
