"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { CheckCircle2, LayoutDashboard, LoaderCircle, MapPin, Minus, Package, Phone, Plus, Search, ShoppingBag, Trash2 } from "lucide-react";
import { apiRequest } from "@/lib/api/client";
import type { PublicStore } from "@/types/public-store";

type Cart = Record<string, number>;
type Confirmation = { code: string; total: number; scheduledAt: string };
const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export default function PublicStorefront({ store }: { store: PublicStore }) {
  const [cart, setCart] = useState<Cart>({});
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Todos");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const categories = useMemo(() => ["Todos", ...new Set(store.products.map((product) => product.category))], [store.products]);
  const products = store.products.filter((product) => (category === "Todos" || product.category === category) && (!search.trim() || `${product.name} ${product.description ?? ""}`.toLocaleLowerCase("pt-BR").includes(search.trim().toLocaleLowerCase("pt-BR"))));
  const cartItems = store.products.filter((product) => cart[product.id]).map((product) => ({ product, quantity: cart[product.id] }));
  const total = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  function change(productId: string, delta: number) {
    const product = store.products.find((item) => item.id === productId); if (!product) return;
    setCart((current) => { const next = Math.max(0, Math.min((current[productId] ?? 0) + delta, product.available ?? 99)); const updated = { ...current }; if (next) updated[productId] = next; else delete updated[productId]; return updated; });
    setConfirmation(null); setError("");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!cartItems.length) return setError("Adicione pelo menos um item ao pedido.");
    const data = new FormData(event.currentTarget);
    try {
      setLoading(true); setError("");
      const result = await apiRequest<Confirmation>(`/public/stores/${store.company.slug}/orders`, { method: "POST", body: JSON.stringify({ customerName: data.get("customerName"), customerPhone: data.get("customerPhone"), fulfillment: data.get("fulfillment"), notes: data.get("notes"), items: cartItems.map((item) => ({ productId: item.product.id, quantity: item.quantity })) }) });
      setConfirmation(result); setCart({}); event.currentTarget.reset();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível enviar o pedido."); }
    finally { setLoading(false); }
  }

  return <main className="min-h-screen bg-slate-50 text-slate-950">
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur"><div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6"><Link href="/" className="flex items-center gap-2"><span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 text-white"><LayoutDashboard className="size-4" /></span><span className="font-black">Gestão<span className="text-violet-600">+</span></span></Link><div className="text-right"><p className="text-xs font-black text-slate-900">{store.company.tradeName}</p><p className="text-[9px] text-slate-400">Página online</p></div></div></header>
    <section className="border-b border-violet-100 bg-gradient-to-br from-violet-50 via-white to-cyan-50"><div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14"><span className="rounded-full bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-violet-600 shadow-sm">Catálogo e pedidos</span><h1 className="mt-4 max-w-3xl text-3xl font-black tracking-tight sm:text-4xl">{store.company.tradeName}</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">{store.company.description || "Escolha seus produtos e envie o pedido diretamente para nossa equipe."}</p><div className="mt-4 flex flex-wrap gap-3 text-[10px] font-semibold text-slate-500">{(store.company.city || store.company.state) && <span className="flex items-center gap-1.5"><MapPin className="size-3.5 text-violet-500" />{[store.company.city, store.company.state].filter(Boolean).join(" - ")}</span>}{(store.company.whatsapp || store.company.phone) && <span className="flex items-center gap-1.5"><Phone className="size-3.5 text-cyan-500" />{store.company.whatsapp || store.company.phone}</span>}</div></div></section>
    <div className="mx-auto grid max-w-7xl items-start gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[1fr_340px]">
      <section><div className="flex flex-col gap-3 sm:flex-row"><label className="relative flex-1"><Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><span className="sr-only">Buscar produtos</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar no catálogo..." className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none focus:border-violet-300 focus:ring-4 focus:ring-violet-100" /></label><div className="flex gap-2 overflow-x-auto pb-1">{categories.map((item) => <button type="button" key={item} onClick={() => setCategory(item)} className={`h-11 shrink-0 rounded-xl px-4 text-xs font-bold ${category === item ? "bg-violet-600 text-white" : "border border-slate-200 bg-white text-slate-600"}`}>{item}</button>)}</div></div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{products.map((product) => <article key={product.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="flex h-32 items-center justify-center bg-gradient-to-br from-slate-50 to-violet-50 bg-cover bg-center" style={product.imageUrl ? { backgroundImage: `url(${product.imageUrl})` } : undefined}>{!product.imageUrl && <Package className="size-7 text-violet-200" />}</div><div className="p-4"><p className="text-[9px] font-bold uppercase tracking-wide text-violet-600">{product.category}</p><h2 className="mt-1 truncate text-sm font-black text-slate-900">{product.name}</h2><p className="mt-1 line-clamp-2 min-h-8 text-[10px] leading-4 text-slate-500">{product.description || "Item disponível para pedido."}</p><div className="mt-3 flex items-center justify-between gap-3"><strong className="text-sm text-slate-950">{money.format(product.price)}</strong>{cart[product.id] ? <div className="flex items-center rounded-xl border border-violet-200 bg-violet-50 p-1"><button type="button" onClick={() => change(product.id, -1)} aria-label={`Diminuir ${product.name}`} className="flex size-7 items-center justify-center"><Minus className="size-3" /></button><span className="w-6 text-center text-xs font-black">{cart[product.id]}</span><button type="button" onClick={() => change(product.id, 1)} aria-label={`Aumentar ${product.name}`} className="flex size-7 items-center justify-center"><Plus className="size-3" /></button></div> : <button type="button" onClick={() => change(product.id, 1)} className="flex h-9 items-center gap-1.5 rounded-xl bg-violet-600 px-3 text-[10px] font-bold text-white"><Plus className="size-3.5" />Adicionar</button>}</div></div></article>)}{!products.length && <div className="col-span-full rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center text-xs text-slate-400">Nenhum item encontrado.</div>}</div>
      </section>
      <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:sticky lg:top-20"><div className="flex items-center gap-3 border-b border-slate-100 pb-3"><span className="flex size-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600"><ShoppingBag className="size-4" /></span><div><h2 className="text-sm font-black">Seu pedido</h2><p className="text-[9px] text-slate-400">{cartItems.reduce((sum, item) => sum + item.quantity, 0)} item(ns)</p></div></div><div className="max-h-56 divide-y divide-slate-100 overflow-y-auto">{cartItems.map(({ product, quantity }) => <div key={product.id} className="flex items-center gap-2 py-3"><div className="min-w-0 flex-1"><p className="truncate text-xs font-bold">{product.name}</p><p className="text-[9px] text-slate-400">{quantity} × {money.format(product.price)}</p></div><strong className="text-xs">{money.format(product.price * quantity)}</strong><button type="button" onClick={() => setCart((current) => { const next = { ...current }; delete next[product.id]; return next; })} aria-label={`Remover ${product.name}`} className="text-slate-300 hover:text-red-500"><Trash2 className="size-3.5" /></button></div>)}{!cartItems.length && <p className="py-6 text-center text-[10px] text-slate-400">Seu carrinho está vazio.</p>}</div><div className="flex justify-between border-t border-slate-100 pt-3 text-sm font-black"><span>Total</span><span>{money.format(total)}</span></div>
        <form onSubmit={submit} className="mt-4 space-y-3"><input name="customerName" required minLength={3} placeholder="Seu nome" className={inputClass} /><input name="customerPhone" required inputMode="tel" placeholder="Telefone ou WhatsApp" className={inputClass} /><select name="fulfillment" required className={inputClass}>{store.company.pickupEnabled && <option value="PICKUP">Retirada no estabelecimento</option>}{store.company.deliveryEnabled && <option value="DELIVERY">Entrega a combinar</option>}</select><textarea name="notes" rows={2} maxLength={500} placeholder="Observações (opcional)" className="w-full resize-none rounded-xl border border-slate-200 p-3 text-xs outline-none focus:border-violet-300 focus:ring-4 focus:ring-violet-100" />{error && <div role="alert" className="rounded-xl bg-red-50 p-3 text-[10px] font-semibold text-red-700">{error}</div>}<button disabled={loading || !cartItems.length} className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-sm font-bold text-white disabled:opacity-50">{loading ? <LoaderCircle className="size-4 animate-spin" /> : <ShoppingBag className="size-4" />}Enviar pedido</button></form>
        {confirmation && <div role="status" className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800"><CheckCircle2 className="size-5" /><p className="mt-2 text-xs font-black">Pedido {confirmation.code} recebido!</p><p className="mt-1 text-[10px] leading-4">Total de {money.format(confirmation.total)}. A empresa entrará em contato para confirmar.</p></div>}
      </aside>
    </div><footer className="border-t border-slate-200 bg-white py-6 text-center text-[10px] text-slate-400">Página criada com Gestão+</footer>
  </main>;
}

const inputClass = "h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-xs text-slate-900 outline-none focus:border-violet-300 focus:ring-4 focus:ring-violet-100";
