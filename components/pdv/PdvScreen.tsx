"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, LoaderCircle, ShieldCheck } from "lucide-react";

import { useCreateSale, useSaleOptions } from "@/features/sales/hooks/useSales";
import { useCompanySettings } from "@/features/settings/hooks/useSettings";
import { useToast } from "@/components/ui/toast";
import { formatCurrency } from "@/lib/format";
import type { PaymentMethod, Sale } from "@/types/sale";
import type { AuthSession } from "@/lib/auth/types";

import PdvHeader from "./PdvHeader";
import ScanBar from "./ScanBar";
import ProductGrid from "./ProductGrid";
import CartPanel, { type CartItem } from "./CartPanel";
import PaymentStep from "./PaymentPanel";
import ReviewItems from "./ReviewItems";
import DoneStep from "./DoneStep";
import SalePreview from "./SalePreview";
import NewCustomerModal from "./NewCustomerModal";

type Step = "items" | "review" | "payment" | "processing" | "done";
const DEFERRED: PaymentMethod[] = ["CHECK", "STORE_CREDIT"];

export default function PdvScreen({ session }: { session: AuthSession }) {
    const { data: options, isLoading: loadingOptions } = useSaleOptions();
    const createSale = useCreateSale();
    const toast = useToast();
    const { data: company } = useCompanySettings();

    const products = useMemo(() => options?.products ?? [], [options]);
    const customers = useMemo(() => options?.customers ?? [], [options]);

    const [step, setStep] = useState<Step>("items");
    const [cart, setCart] = useState<CartItem[]>([]);
    const [scanInput, setScanInput] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [category, setCategory] = useState("Todos");
    const [customerId, setCustomerId] = useState("");
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(company?.defaultPayment ?? "PIX");
    const [dueDate, setDueDate] = useState(() => {
        const value = new Date();
        value.setDate(value.getDate() + 1);
        return value.toISOString().slice(0, 10);
    });
    const [discount, setDiscount] = useState("0");
    const [customerDocument, setCustomerDocument] = useState("");
    const [newCustomerOpen, setNewCustomerOpen] = useState(false);
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
    const selectedCustomer = customers.find((customer) => customer.id === customerId);
    const selectedCustomerName = selectedCustomer ? selectedCustomer.tradeName || selectedCustomer.name : "Consumidor final";

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
        if (DEFERRED.includes(paymentMethod) && !customerId) return toast.error("Cheque ou fiado exige cliente.");
        if (DEFERRED.includes(paymentMethod) && !dueDate) return toast.error("Informe o vencimento do pagamento.");
        setStep("processing");
    }

    /** Etapa 4 → 5: confirmação final — envia a venda. */
    function confirmPayment() {
        void createSale
            .mutateAsync({
                customerId: customerId || undefined,
                customerDocument: customerDocument || undefined,
                paymentMethod,
                dueDate: DEFERRED.includes(paymentMethod) ? dueDate : undefined,
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
        setPaymentMethod(company?.defaultPayment ?? "PIX");
        setSaleResult(null);
        setStep("items");
        keepScanFocus();
    }

    return (
        <div
            className="flex min-h-screen flex-col bg-[#123d2b] font-[family-name:var(--font-manrope)] text-white"
            onKeyDown={(event) => {
                if (event.key === "F4" && !(event.target instanceof HTMLInputElement)) {
                    event.preventDefault();
                    if (step === "items") goToReview();
                }
            }}
        >
            <PdvHeader session={session} />

            <div className="flex flex-1 items-start justify-center p-4 lg:p-6">
                {step === "items" && (
                    <div className="grid w-full max-w-6xl flex-1 gap-4 lg:grid-cols-[1fr_400px]">
                        <section className="flex flex-col gap-4">
                            <ScanBar value={scanInput} onChange={setScanInput} onEnter={handleScan} onClear={() => { setScanInput(""); setSearchTerm(""); keepScanFocus(); }} ref={scanRef} />
                            <div className="flex items-center justify-between">
                                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-white/60">
                                    {searchTerm ? `Resultados para "${searchTerm}"` : "Catálogo disponível"}
                                </p>
                                <span className="rounded-full bg-white/5 px-2.5 py-1 font-mono text-[10px] font-bold text-white/60">{availableProducts.length} produto(s)</span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {categories.map((item) => (
                                    <button
                                        key={item}
                                        type="button"
                                        onClick={() => setCategory(item)}
                                        className={`rounded-full px-3 py-1.5 font-mono text-[11px] font-bold transition ${
                                            category === item ? "bg-[#ffb21a] text-[#123d2b]" : "bg-white/5 text-white/60 hover:bg-white/10"
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
                            <button type="button" onClick={goToReview} disabled={!cart.length} className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 font-[family-name:var(--font-bricolage)] text-base font-black text-white shadow-lg shadow-orange-950/50 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40">
                                Confirmar itens — {formatCurrency(total)}
                            </button>
                            <p className="text-center font-mono text-[10px] text-white/40">Após confirmar, você escolhe o pagamento e finaliza.</p>
                        </aside>
                    </div>
                )}

                {step === "review" && (
                    <div className="grid w-full max-w-6xl gap-6 lg:grid-cols-[1fr_340px]">
                        <div className="flex justify-center">
                            <ReviewItems cart={cart} subtotal={subtotal} discount={discountValue} total={total} onBack={() => setStep("items")} onNext={goToPayment} />
                        </div>
                        <SalePreview cart={cart} subtotal={subtotal} discount={discountValue} total={total} customerName={selectedCustomerName} paymentMethod={paymentMethod} customerDocument={customerDocument || undefined} />
                    </div>
                )}

                {step === "payment" && (
                    <div className="grid w-full max-w-6xl gap-6 lg:grid-cols-[1fr_340px]">
                        <div className="flex justify-center">
                            <PaymentStep
                                customers={customers}
                                requireCustomer={Boolean(company?.requireCustomer)}
                                customerId={customerId}
                                onCustomer={setCustomerId}
                                onNewCustomer={() => setNewCustomerOpen(true)}
                                paymentMethod={paymentMethod}
                                onPaymentMethod={setPaymentMethod}
                                dueDate={dueDate}
                                onDueDate={setDueDate}
                                customerDocument={customerDocument}
                                onCustomerDocument={setCustomerDocument}
                                total={total}
                                onPay={pay}
                            />
                        </div>
                        <SalePreview cart={cart} subtotal={subtotal} discount={discountValue} total={total} customerName={selectedCustomerName} paymentMethod={paymentMethod} customerDocument={customerDocument || undefined} />
                    </div>
                )}

                {step === "processing" && (
                    <div className="grid w-full max-w-6xl gap-6 lg:grid-cols-[1fr_340px]">
                        <div className="flex justify-center">
                            <div className="mx-auto flex w-full max-w-md flex-col items-center rounded-2xl border-2 border-white/10 bg-[#0a2418] p-8 text-center">
                                <span className="flex size-16 items-center justify-center rounded-full bg-[#ffb21a]/15 text-[#ffb21a]">
                                    <ShieldCheck className="size-8" />
                                </span>
                                <h2 className="mt-4 font-[family-name:var(--font-bricolage)] text-2xl font-black text-white">Pagamento efetuado?</h2>
                                <p className="mt-2 max-w-xs text-sm leading-6 text-white/60">
                                    Confirme que o pagamento de <strong className="text-[#ffb21a]">{formatCurrency(total)}</strong> foi recebido
                                    ({paymentMethod === "PIX" ? "PIX" : paymentMethod === "CASH" ? "dinheiro" : paymentMethodLabelsSafe(paymentMethod)}).
                                </p>
                                {createSale.isPending && (
                                    <p className="mt-4 flex items-center gap-2 font-mono text-xs text-white/50"><LoaderCircle className="size-4 animate-spin" />Finalizando venda...</p>
                                )}
                                <div className="mt-6 grid w-full grid-cols-2 gap-2">
                                    <button type="button" onClick={() => setStep("payment")} disabled={createSale.isPending} className="flex h-14 items-center justify-center gap-2 rounded-xl border border-white/15 text-sm font-bold text-white/70 transition hover:bg-white/5 disabled:opacity-50">
                                        <ArrowLeft className="size-4" /> Voltar
                                    </button>
                                    <button type="button" onClick={confirmPayment} disabled={createSale.isPending} className="flex h-14 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 font-[family-name:var(--font-bricolage)] text-sm font-black text-white transition hover:brightness-110 disabled:opacity-60">
                                        {createSale.isPending ? <><LoaderCircle className="size-4 animate-spin" />Finalizando...</> : <>Confirmar pagamento</>}
                                    </button>
                                </div>
                            </div>
                        </div>
                        <SalePreview cart={cart} subtotal={subtotal} discount={discountValue} total={total} customerName={selectedCustomerName} paymentMethod={paymentMethod} customerDocument={customerDocument || undefined} />
                    </div>
                )}

                {step === "done" && saleResult && (
                    <DoneStep sale={saleResult} company={company ? { tradeName: company.tradeName, document: company.document, city: company.city, state: company.state } : null} onFinish={resetSale} />
                )}
            </div>

            <footer className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 border-t border-white/10 bg-[#0a2418] px-4 py-2 font-mono text-[10px] font-semibold text-white/60">
                {step === "items" ? (
                    <><Kbd>F2</Kbd> ou <Kbd>/</Kbd> focar busca · <Kbd>Enter</Kbd> confirmar leitura · <Kbd>F4</Kbd> confirmar itens · <Kbd>+</Kbd>/<Kbd>−</Kbd> quantidade · <Kbd>⛶</Kbd> tela cheia</>
                ) : (
                    <><Kbd>Etapa {stepIndex(step)} de 4</Kbd> · {stepLabel(step)}</>
                )}
            </footer>

            {newCustomerOpen && (
                <NewCustomerModal onCreated={(customer) => { setCustomerId(customer.id); setNewCustomerOpen(false); }} onClose={() => setNewCustomerOpen(false)} />
            )}
        </div>
    );
}

function Kbd({ children }: { children: import("react").ReactNode }) {
    return <kbd className="rounded-md border border-white/15 bg-white/5 px-1.5 py-0.5 text-[10px] text-white">{children}</kbd>;
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
