"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useCreateSale, useSaleOptions } from "@/features/sales/hooks/useSales";
import { useCompanySettings } from "@/features/settings/hooks/useSettings";
import { useToast } from "@/components/ui/toast";
import { formatCurrency } from "@/lib/format";
import type { PaymentMethod } from "@/types/sale";
import type { AuthSession } from "@/lib/auth/types";

import PdvHeader from "./PdvHeader";
import ScanBar from "./ScanBar";
import ProductGrid from "./ProductGrid";
import CartPanel, { type CartItem } from "./CartPanel";
import PaymentPanel from "./PaymentPanel";

const DEFERRED: PaymentMethod[] = ["CHECK", "STORE_CREDIT"];

export default function PdvScreen({ session }: { session: AuthSession }) {
    const { data: options, isLoading: loadingOptions } = useSaleOptions();
    const createSale = useCreateSale();
    const toast = useToast();
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
    const scanRef = useRef<HTMLInputElement>(null);

    // Campo de scan sempre focado (leitor de código de barras).
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

    const cartCounts = useMemo(
        () => Object.fromEntries(cart.map((item) => [item.product.id, item.quantity])) as Record<string, number>,
        [cart],
    );
    const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const discountValue = Math.max(0, Math.min(Number(discount) || 0, company?.maximumDiscount ?? 100));
    const total = Math.max(0, subtotal - discountValue);

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

    function finishSale() {
        if (!cart.length) return toast.error("Adicione pelo menos um item ao carrinho.");
        if (company?.requireCustomer && !customerId) return toast.error("Esta empresa exige cliente identificado.");
        if (DEFERRED.includes(paymentMethod) && !customerId) return toast.error("Cheque ou fiado exige cliente.");
        if (DEFERRED.includes(paymentMethod) && !dueDate) return toast.error("Informe o vencimento do pagamento.");

        void createSale
            .mutateAsync({
                customerId: customerId || undefined,
                paymentMethod,
                dueDate: DEFERRED.includes(paymentMethod) ? dueDate : undefined,
                discount: discountValue,
                items: cart.map((item) => ({ productId: item.product.id, quantity: item.quantity })),
            })
            .then((sale) => {
                toast.success(`Venda ${sale.code} registrada — total ${formatCurrency(sale.total)}`);
                setCart([]);
                setCustomerId("");
                setDiscount("0");
                setSearchTerm("");
                setScanInput("");
                setPaymentMethod(company?.defaultPayment ?? "PIX");
                keepScanFocus();
            })
            .catch((cause: unknown) => toast.error(cause instanceof Error ? cause.message : "Não foi possível concluir a venda."));
    }

    return (
        <div
            className="flex min-h-screen flex-col bg-[#123d2b] font-[family-name:var(--font-manrope)] text-slate-100"
            onKeyDown={(event) => {
                if (event.key === "F4" && !(event.target instanceof HTMLInputElement)) {
                    event.preventDefault();
                    finishSale();
                }
            }}
        >
            <PdvHeader session={session} />

            <div className="grid flex-1 gap-4 p-4 lg:grid-cols-[1fr_400px]">
                <section className="flex flex-col gap-4">
                    <ScanBar value={scanInput} onChange={setScanInput} onEnter={handleScan} onClear={() => { setScanInput(""); setSearchTerm(""); keepScanFocus(); }} ref={scanRef} />

                    <div className="flex items-center justify-between">
                        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-white/70">
                            {searchTerm ? `Resultados para "${searchTerm}"` : "Catálogo disponível"}
                        </p>
                        <span className="rounded-full bg-white/5 px-2.5 py-1 font-mono text-[10px] font-bold text-white/80">
                            {availableProducts.length} produto(s)
                        </span>
                    </div>

                    <ProductGrid products={availableProducts} loading={loadingOptions} cartCounts={cartCounts} onAdd={addProduct} />
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
                    <PaymentPanel
                        customers={customers}
                        requireCustomer={Boolean(company?.requireCustomer)}
                        customerId={customerId}
                        onCustomer={setCustomerId}
                        paymentMethod={paymentMethod}
                        onPaymentMethod={setPaymentMethod}
                        dueDate={dueDate}
                        onDueDate={setDueDate}
                        total={total}
                        pending={createSale.isPending}
                        disabled={!cart.length}
                        onFinish={finishSale}
                    />
                </aside>
            </div>

            <footer className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 border-t border-white/10 bg-[#0a2418] px-4 py-2 font-mono text-[10px] font-semibold text-white/70">
                <Kbd>F2</Kbd> ou <Kbd>/</Kbd> focar busca · <Kbd>Enter</Kbd> confirmar leitura · <Kbd>F4</Kbd> finalizar venda · <Kbd>+</Kbd>/<Kbd>−</Kbd> quantidade · <Kbd>Esc</Kbd> limpar · <Kbd>⛶</Kbd> tela cheia
            </footer>
        </div>
    );
}

function Kbd({ children }: { children: import("react").ReactNode }) {
    return <kbd className="rounded-md border border-white/15 bg-white/5 px-1.5 py-0.5 text-[10px] text-white">{children}</kbd>;
}
