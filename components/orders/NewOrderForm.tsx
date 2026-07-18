"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, type ReactNode, useEffect, useMemo, useState } from "react";
import { ArrowLeft, LoaderCircle, Minus, PackagePlus, Plus, Save, ShoppingBag, Trash2 } from "lucide-react";

import { apiRequest } from "@/lib/api/client";
import type { Customer } from "@/types/customer";
import { fulfillmentLabels, orderChannelLabels, type FulfillmentMethod, type Order, type OrderChannel } from "@/types/order";
import type { Product } from "@/types/product";

type CartItem = { product: Product; quantity: number };
const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const channels = Object.keys(orderChannelLabels) as OrderChannel[];
const fulfillments = Object.keys(fulfillmentLabels) as FulfillmentMethod[];

export default function NewOrderForm() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [items, setItems] = useState<CartItem[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    Promise.all([apiRequest<Product[]>("/products"), apiRequest<Customer[]>("/customers")])
      .then(([productData, customerData]) => {
        if (!mounted) return;
        const available = productData.filter((product) => product.active && (!product.trackStock || product.stock - product.reservedStock > 0));
        setProducts(available);
        setCustomers(customerData.filter((customer) => customer.active));
        setSelectedProductId(available[0]?.id ?? "");
      })
      .catch((requestError: unknown) => { if (mounted) setError(requestError instanceof Error ? requestError.message : "Não foi possível carregar os dados do pedido."); })
      .finally(() => { if (mounted) setLoadingOptions(false); });
    return () => { mounted = false; };
  }, []);

  const total = useMemo(() => items.reduce((sum, item) => sum + item.product.price * item.quantity, 0), [items]);

  function addProduct() {
    const product = products.find((item) => item.id === selectedProductId);
    if (!product) return;
    setItems((current) => {
      const existing = current.find((item) => item.product.id === product.id);
      if (!existing) return [...current, { product, quantity: 1 }];
      const available = product.stock - product.reservedStock;
      if (product.trackStock && existing.quantity >= available) return current;
      return current.map((item) => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
    });
    setError("");
  }

  function changeQuantity(productId: string, delta: number) {
    setItems((current) => current.flatMap((item) => {
      if (item.product.id !== productId) return [item];
      const next = item.quantity + delta;
      if (next <= 0) return [];
      if (item.product.trackStock && next > item.product.stock - item.product.reservedStock) return [item];
      return [{ ...item, quantity: next }];
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const customerId = String(formData.get("customerId") ?? "");
    const scheduledDate = String(formData.get("scheduledDate") ?? "");
    const scheduledTime = String(formData.get("scheduledTime") ?? "");
    setError("");
    if (!customerId) return setError("Selecione um cliente.");
    if (!items.length) return setError("Adicione pelo menos um produto ou serviço ao pedido.");
    try {
      setLoading(true);
      await apiRequest<Order>("/orders", {
        method: "POST",
        body: JSON.stringify({
          customerId,
          channel: formData.get("channel"),
          fulfillment: formData.get("fulfillment"),
          scheduledAt: new Date(`${scheduledDate}T${scheduledTime}:00`).toISOString(),
          discount: 0,
          notes: String(formData.get("notes") ?? "") || undefined,
          items: items.map((item) => ({ productId: item.product.id, quantity: item.quantity })),
        }),
      });
      router.push("/pedidos");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Não foi possível salvar o pedido.");
    } finally { setLoading(false); }
  }

  return (
    <section>
      <div className="flex items-start gap-3"><Link href="/pedidos" aria-label="Voltar para pedidos" className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm hover:border-violet-200 hover:text-violet-600"><ArrowLeft className="size-4" /></Link><div><p className="text-[11px] font-bold uppercase tracking-[0.14em] text-violet-600">Comercial</p><h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">Novo pedido</h1><p className="mt-1 text-xs text-slate-500">Registre os dados e reserve os itens para atendimento.</p></div></div>

      <form onSubmit={handleSubmit} className="mt-5 grid items-start gap-4 xl:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <SectionTitle icon={<ShoppingBag className="size-4" />} title="Dados do pedido" description="Cliente, origem e atendimento" />
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Cliente" id="customerId" className="sm:col-span-2"><select id="customerId" name="customerId" required defaultValue="" className={inputClassName}><option value="" disabled>Selecione o cliente</option>{customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.tradeName || customer.name}</option>)}</select></Field>
              <Field label="Canal" id="channel"><select id="channel" name="channel" defaultValue="COUNTER" className={inputClassName}>{channels.map((channel) => <option key={channel} value={channel}>{orderChannelLabels[channel]}</option>)}</select></Field>
              <Field label="Forma de atendimento" id="fulfillment"><select id="fulfillment" name="fulfillment" defaultValue="PICKUP" className={inputClassName}>{fulfillments.map((method) => <option key={method} value={method}>{fulfillmentLabels[method]}</option>)}</select></Field>
              <Field label="Data prevista" id="scheduledDate"><input id="scheduledDate" name="scheduledDate" type="date" required defaultValue={localDateValue()} className={inputClassName} /></Field>
              <Field label="Horário previsto" id="scheduledTime"><input id="scheduledTime" name="scheduledTime" type="time" required defaultValue="12:30" className={inputClassName} /></Field>
              <Field label="Observações" id="notes" className="sm:col-span-2"><textarea id="notes" name="notes" rows={3} placeholder="Preferências, entrega ou instruções..." className="w-full resize-none rounded-xl border border-slate-200 px-3.5 py-3 text-sm outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100" /></Field>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <SectionTitle icon={<PackagePlus className="size-4" />} title="Itens do pedido" description="Produtos e serviços disponíveis" />
            <div className="mt-4 flex flex-col gap-2 sm:flex-row"><select value={selectedProductId} disabled={loadingOptions || !products.length} onChange={(event) => setSelectedProductId(event.target.value)} className={`${inputClassName} flex-1`}>{products.map((product) => <option key={product.id} value={product.id}>{product.name} · {currencyFormatter.format(product.price)} · {product.trackStock ? `${product.stock - product.reservedStock} disp.` : "serviço"}</option>)}</select><button type="button" disabled={!selectedProductId} onClick={addProduct} className="flex h-11 items-center justify-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-4 text-xs font-bold text-violet-700 disabled:opacity-50"><Plus className="size-4" />Adicionar item</button></div>
            {items.length ? <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">{items.map((item) => <div key={item.product.id} className="flex flex-col gap-3 border-b border-slate-100 p-3 last:border-0 sm:flex-row sm:items-center"><div className="min-w-0 flex-1"><p className="truncate text-xs font-bold text-slate-800">{item.product.name}</p><p className="mt-0.5 text-[10px] text-slate-400">{currencyFormatter.format(item.product.price)} por unidade</p></div><div className="flex items-center gap-3"><div className="flex items-center rounded-xl border"><button type="button" onClick={() => changeQuantity(item.product.id, -1)} className="flex size-9 items-center justify-center"><Minus className="size-3.5" /></button><span className="w-8 text-center text-xs font-bold">{item.quantity}</span><button type="button" onClick={() => changeQuantity(item.product.id, 1)} className="flex size-9 items-center justify-center"><Plus className="size-3.5" /></button></div><p className="w-24 text-right text-xs font-black">{currencyFormatter.format(item.product.price * item.quantity)}</p><button type="button" onClick={() => setItems((current) => current.filter((currentItem) => currentItem.product.id !== item.product.id))} aria-label={`Remover ${item.product.name}`} className="flex size-9 items-center justify-center rounded-xl text-red-500 hover:bg-red-50"><Trash2 className="size-3.5" /></button></div></div>)}</div> : <div className="mt-4 rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center text-xs text-slate-500">{loadingOptions ? "Carregando produtos..." : "Nenhum item adicionado."}</div>}
          </div>
        </div>

        <aside className="xl:sticky xl:top-20"><div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"><h2 className="text-sm font-bold text-slate-950">Resumo</h2><div className="mt-4 space-y-3 border-y border-slate-100 py-4"><div className="flex justify-between text-xs text-slate-500"><span>Itens</span><strong>{items.reduce((sum, item) => sum + item.quantity, 0)}</strong></div><div className="flex justify-between text-xs text-slate-500"><span>Total</span><strong>{currencyFormatter.format(total)}</strong></div></div>{error && <div role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">{error}</div>}<button type="submit" disabled={loading || loadingOptions} className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 text-sm font-bold text-white disabled:opacity-60">{loading ? <><LoaderCircle className="size-4 animate-spin" />Salvando...</> : <><Save className="size-4" />Salvar pedido</>}</button><p className="mt-3 text-center text-[9px] text-slate-400">Os itens controlados serão reservados ao salvar.</p></div></aside>
      </form>
    </section>
  );
}

const inputClassName = "h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-950 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100";
function Field({ label, id, children, className = "" }: { label: string; id: string; children: ReactNode; className?: string }) { return <div className={className}><label htmlFor={id} className="mb-1.5 block text-xs font-bold text-slate-700">{label}</label>{children}</div>; }
function SectionTitle({ icon, title, description }: { icon: ReactNode; title: string; description: string }) { return <div className="flex items-center gap-3 border-b border-slate-100 pb-4"><div className="flex size-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600">{icon}</div><div><h2 className="text-sm font-bold text-slate-950">{title}</h2><p className="mt-0.5 text-[10px] text-slate-400">{description}</p></div></div>; }
function localDateValue() { const now = new Date(); return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`; }
