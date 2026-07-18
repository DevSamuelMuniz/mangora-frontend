"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  LoaderCircle,
  Minus,
  Package,
  Plus,
  Search,
  ShoppingCart,
  Trash2,
  WalletCards,
} from "lucide-react";

import { apiRequest } from "@/lib/api/client";
import type { Customer } from "@/types/customer";
import type { Product } from "@/types/product";
import { paymentMethodLabels, type PaymentMethod, type Sale } from "@/types/sale";

type CartItem = {
  product: Product;
  quantity: number;
};

const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const paymentMethods: PaymentMethod[] = ["PIX", "CREDIT_CARD", "DEBIT_CARD", "CASH", "BOLETO"];

export default function NewSaleForm() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [discount, setDiscount] = useState("0");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    Promise.all([apiRequest<Product[]>("/products"), apiRequest<Customer[]>("/customers")])
      .then(([productData, customerData]) => {
        if (!mounted) return;
        setProducts(productData);
        setCustomers(customerData);
      })
      .catch((requestError: unknown) => {
        if (mounted) setError(requestError instanceof Error ? requestError.message : "Não foi possível carregar os dados da venda.");
      })
      .finally(() => { if (mounted) setLoadingOptions(false); });
    return () => { mounted = false; };
  }, []);

  const availableProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("pt-BR");
    return products
      .filter((product) => product.active && (!product.trackStock || product.stock - product.reservedStock > 0))
      .filter((product) => !normalizedSearch || `${product.name} ${product.sku}`.toLocaleLowerCase("pt-BR").includes(normalizedSearch));
  }, [products, search]);

  const subtotal = cart.reduce((total, item) => total + item.product.price * item.quantity, 0);
  const discountValue = Math.max(0, Number(discount) || 0);
  const total = Math.max(0, subtotal - discountValue);
  const itemCount = cart.reduce((totalItems, item) => totalItems + item.quantity, 0);

  function addProduct(product: Product) {
    setError("");
    setCart((current) => {
      const existing = current.find((item) => item.product.id === product.id);
      if (!existing) return [...current, { product, quantity: 1 }];
      if (product.trackStock && existing.quantity >= product.stock - product.reservedStock) return current;
      return current.map((item) => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
    });
  }

  function changeQuantity(productId: string, change: number) {
    setCart((current) => current.flatMap((item) => {
      if (item.product.id !== productId) return [item];
      const nextQuantity = item.quantity + change;
      if (nextQuantity <= 0) return [];
      if (item.product.trackStock && nextQuantity > item.product.stock - item.product.reservedStock) return [item];
      return [{ ...item, quantity: nextQuantity }];
    }));
  }

  async function finishSale() {
    setError("");

    if (!cart.length) {
      setError("Adicione pelo menos um item à venda.");
      return;
    }
    if (!paymentMethod) {
      setError("Selecione uma forma de pagamento.");
      return;
    }
    if (discountValue > subtotal) {
      setError("O desconto não pode ser maior que o subtotal.");
      return;
    }

    try {
      setLoading(true);
      const created = await apiRequest<Sale>("/sales", {
        method: "POST",
        body: JSON.stringify({
          customerId: customerId || undefined,
          paymentMethod,
          discount: discountValue,
          items: cart.map((item) => ({ productId: item.product.id, quantity: item.quantity })),
        }),
      });
      router.push(`/vendas?selecionada=${created.id}`);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Não foi possível concluir a venda.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section>
      <div className="flex items-start gap-3">
        <Link href="/vendas" aria-label="Voltar para vendas" className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-50 hover:text-violet-600">
          <ArrowLeft className="size-4" />
        </Link>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-violet-600">Comercial</p>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">Nova venda</h1>
          <p className="mt-1 text-xs text-slate-500">Selecione os itens e confira o resumo antes de finalizar.</p>
        </div>
      </div>

      <div className="mt-5 grid items-start gap-4 xl:grid-cols-[1.35fr_0.75fr]">
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="flex size-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600"><Package className="size-4" /></div>
              <div><h2 className="text-sm font-bold text-slate-950">Selecionar produtos</h2><p className="mt-0.5 text-[10px] text-slate-400">Busque pelo nome ou SKU e adicione ao carrinho.</p></div>
            </div>

            <label className="relative mt-4 block">
              <span className="sr-only">Buscar produtos para venda</span>
              <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar produto por nome ou SKU..." className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-violet-300 focus:bg-white focus:ring-4 focus:ring-violet-100" />
            </label>

            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {loadingOptions ? (
                <div className="col-span-full flex items-center justify-center px-4 py-8 text-xs text-slate-500"><LoaderCircle className="mr-2 size-4 animate-spin text-violet-600" />Carregando produtos...</div>
              ) : availableProducts.length ? availableProducts.map((product) => {
                const inCart = cart.find((item) => item.product.id === product.id)?.quantity ?? 0;
                const availableStock = product.stock - product.reservedStock;
                const unavailable = product.trackStock && inCart >= availableStock;
                return (
                  <button key={product.id} type="button" onClick={() => addProduct(product)} disabled={unavailable} className="group flex min-w-0 items-center gap-3 rounded-xl border border-slate-200 p-3 text-left transition hover:border-violet-200 hover:bg-violet-50/40 disabled:cursor-not-allowed disabled:opacity-50">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 group-hover:bg-violet-100 group-hover:text-violet-600"><Package className="size-4" /></div>
                    <div className="min-w-0 flex-1"><p className="truncate text-xs font-bold text-slate-800">{product.name}</p><p className="mt-0.5 text-[9px] text-slate-400">{product.sku} · {product.trackStock ? `${availableStock} un. disponíveis` : "Sem controle de estoque"}</p></div>
                    <div className="shrink-0 text-right"><p className="text-xs font-black text-slate-900">{currencyFormatter.format(product.price)}</p><span className="mt-1 inline-flex size-5 items-center justify-center rounded-md bg-violet-50 text-violet-600"><Plus className="size-3" /></span></div>
                  </button>
                );
              }) : (
                <div className="col-span-full rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center text-xs text-slate-500">Nenhum produto disponível para esta busca.</div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex items-center justify-between gap-4"><div><h2 className="text-sm font-bold text-slate-950">Itens da venda</h2><p className="mt-0.5 text-[10px] text-slate-400">{itemCount} item(ns) selecionado(s)</p></div><ShoppingCart className="size-4 text-violet-600" /></div>
            <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
              {cart.length ? cart.map((item) => (
                <div key={item.product.id} className="flex flex-col gap-3 border-b border-slate-100 p-3 last:border-0 sm:flex-row sm:items-center">
                  <div className="min-w-0 flex-1"><p className="truncate text-xs font-bold text-slate-800">{item.product.name}</p><p className="mt-1 text-[10px] text-slate-400">{currencyFormatter.format(item.product.price)} por unidade</p></div>
                  <div className="flex items-center justify-between gap-4 sm:justify-end">
                    <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1">
                      <button type="button" onClick={() => changeQuantity(item.product.id, -1)} aria-label={`Diminuir ${item.product.name}`} className="flex size-7 items-center justify-center rounded-lg text-slate-500 hover:bg-white"><Minus className="size-3" /></button>
                      <span className="w-8 text-center text-xs font-black text-slate-800">{item.quantity}</span>
                      <button type="button" onClick={() => changeQuantity(item.product.id, 1)} aria-label={`Aumentar ${item.product.name}`} className="flex size-7 items-center justify-center rounded-lg text-slate-500 hover:bg-white"><Plus className="size-3" /></button>
                    </div>
                    <p className="w-24 text-right text-xs font-black text-slate-900">{currencyFormatter.format(item.product.price * item.quantity)}</p>
                    <button type="button" onClick={() => setCart((current) => current.filter((cartItem) => cartItem.product.id !== item.product.id))} aria-label={`Remover ${item.product.name}`} className="flex size-8 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600"><Trash2 className="size-3.5" /></button>
                  </div>
                </div>
              )) : (
                <div className="flex min-h-36 flex-col items-center justify-center p-6 text-center"><ShoppingCart className="size-5 text-slate-300" /><p className="mt-2 text-xs font-bold text-slate-600">Carrinho vazio</p><p className="mt-1 text-[10px] text-slate-400">Adicione produtos para iniciar a venda.</p></div>
              )}
            </div>
          </div>
        </div>

        <aside className="space-y-4 xl:sticky xl:top-20">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4"><div className="flex size-9 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600"><WalletCards className="size-4" /></div><div><h2 className="text-sm font-bold text-slate-950">Resumo da venda</h2><p className="mt-0.5 text-[10px] text-slate-400">Cliente, pagamento e totais.</p></div></div>

            <div className="mt-4 space-y-4">
              <Field label="Cliente (opcional)" id="customerId">
                <select id="customerId" value={customerId} onChange={(event) => setCustomerId(event.target.value)} className={inputClassName}>
                  <option value="">Consumidor final</option>
                  {customers.filter((customer) => customer.active).map((customer) => <option key={customer.id} value={customer.id}>{customer.tradeName || customer.name}</option>)}
                </select>
              </Field>
              <Field label="Forma de pagamento" id="paymentMethod">
                <select id="paymentMethod" value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)} className={inputClassName}>
                  <option value="">Selecione</option>
                  {paymentMethods.map((method) => <option key={method} value={method}>{paymentMethodLabels[method]}</option>)}
                </select>
              </Field>
              {paymentMethod === "CASH" && <p className="rounded-xl bg-amber-50 p-3 text-[10px] leading-4 text-amber-700">Vendas em dinheiro são registradas no caixa aberto da empresa.</p>}
              <Field label="Desconto" id="discount">
                <div className="relative"><span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">R$</span><input id="discount" type="number" min="0" step="0.01" value={discount} onChange={(event) => setDiscount(event.target.value)} className={`${inputClassName} pl-10`} /></div>
              </Field>
            </div>

            <div className="my-5 h-px bg-slate-200" />
            <dl className="space-y-3 text-xs"><div className="flex justify-between gap-4 text-slate-500"><dt>Subtotal</dt><dd className="font-bold text-slate-700">{currencyFormatter.format(subtotal)}</dd></div><div className="flex justify-between gap-4 text-slate-500"><dt>Desconto</dt><dd className="font-bold text-red-600">- {currencyFormatter.format(discountValue)}</dd></div><div className="flex items-end justify-between gap-4 border-t border-slate-100 pt-4"><dt className="font-bold text-slate-800">Total</dt><dd className="text-2xl font-black tracking-tight text-slate-950">{currencyFormatter.format(total)}</dd></div></dl>

            {error && <div role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs font-semibold text-red-700">{error}</div>}
            <button type="button" disabled={loading || loadingOptions} onClick={finishSale} className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 text-sm font-bold text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0">
              {loading ? <><LoaderCircle className="size-4 animate-spin" />Finalizando...</> : <><CheckCircle2 className="size-4" />Finalizar venda</>}
            </button>
            <p className="mt-3 text-center text-[9px] leading-4 text-slate-400">Ao finalizar, a venda e a baixa de estoque são registradas juntas.</p>
          </div>
        </aside>
      </div>
    </section>
  );
}

const inputClassName = "h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-950 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100";

function Field({ label, id, children }: { label: string; id: string; children: ReactNode }) {
  return <div><label htmlFor={id} className="mb-1.5 block text-xs font-bold text-slate-700">{label}</label>{children}</div>;
}
