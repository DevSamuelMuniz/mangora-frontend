"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState, type CSSProperties } from "react";
import { CheckCircle2, ChevronDown, Clock3, LoaderCircle, MapPin, Minus, Package, Phone, Plus, Search, ShoppingBag, Trash2 } from "lucide-react";
import type { PublicStore } from "@/types/public-store";
import { formatCurrency } from "@/lib/format";
import { useCreatePublicOrder, type PublicOrderConfirmation } from "@/features/public-store/hooks/usePublicStore";

type Cart = Record<string, number>;

/** Página de vendas da loja — identidade 100% do cliente (cor, capa, logo, anúncio). */
export default function PublicStorefront({ store }: { store: PublicStore }) {
  const createOrder = useCreatePublicOrder();
  const loading = createOrder.isPending;
  const [cart, setCart] = useState<Cart>({});
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Todos");
  const [error, setError] = useState("");
  const [confirmation, setConfirmation] = useState<PublicOrderConfirmation | null>(null);

  const brand = store.company.brandColor || "#ff6b1a";
  const company = store.company;
  const categories = useMemo(() => ["Todos", ...new Set(store.products.map((product) => product.category))], [store.products]);
  const products = store.products.filter((product) => (category === "Todos" || product.category === category) && (!search.trim() || `${product.name} ${product.description ?? ""}`.toLocaleLowerCase("pt-BR").includes(search.trim().toLocaleLowerCase("pt-BR"))));
  const cartItems = store.products.filter((product) => cart[product.id]).map((product) => ({ product, quantity: cart[product.id] }));
  const total = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const whatsappDigits = (company.whatsapp || company.phone || "").replace(/\D/g, "");
  const whatsappUrl = whatsappDigits ? `https://wa.me/55${whatsappDigits}` : null;
  const cityLine = [company.city, company.state].filter(Boolean).join(" - ");

  function change(productId: string, delta: number) {
    const product = store.products.find((item) => item.id === productId); if (!product) return;
    setCart((current) => { const next = Math.max(0, Math.min((current[productId] ?? 0) + delta, product.available ?? 99)); const updated = { ...current }; if (next) updated[productId] = next; else delete updated[productId]; return updated; });
    setConfirmation(null); setError("");
  }

  function scrollToMenu() {
    document.getElementById("cardapio")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!cartItems.length) return setError("Adicione pelo menos um item ao pedido.");
    const data = new FormData(event.currentTarget);
    try {
      setError("");
      const result = await createOrder.mutateAsync({ slug: company.slug, payload: { customerName: data.get("customerName"), customerPhone: data.get("customerPhone"), fulfillment: data.get("fulfillment"), notes: data.get("notes"), items: cartItems.map((item) => ({ productId: item.product.id, quantity: item.quantity })) } });
      setConfirmation(result); setCart({}); event.currentTarget.reset();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível enviar o pedido."); }
  }

  return (
    <main className="mangora-public min-h-screen bg-[#fffdf8] text-[#123d2b]" style={{ "--brand": brand } as CSSProperties}>
      {/* Barra de anúncio */}
      {company.announcement && (
        <div className="bg-[var(--brand)] px-4 py-2 text-center text-[11px] font-bold text-white">{company.announcement}</div>
      )}

      {/* Cabeçalho fixo */}
      <header className="sticky top-0 z-30 border-b border-[#123d2b]/10 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
          <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label="Mangora — página inicial">
            {company.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={company.logoUrl} alt={`Logo de ${company.tradeName}`} className="h-9 w-auto max-w-36 object-contain" />
            ) : (
              <span className="flex size-9 items-center justify-center rounded-xl font-[family-name:var(--font-bricolage)] text-base font-black text-white" style={{ backgroundColor: brand }}>{company.tradeName.charAt(0).toUpperCase()}</span>
            )}
          </Link>
          <div className="min-w-0 text-right">
            <p className="truncate text-xs font-black text-[#123d2b]">{company.tradeName}</p>
            <p className="text-[9px] uppercase tracking-wider text-[#123d2b]/50">Página online</p>
          </div>
        </div>
      </header>

      {/* Hero com a identidade do cliente */}
      <section className="relative overflow-hidden">
        {company.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={company.coverUrl} alt={`Capa de ${company.tradeName}`} className="absolute inset-0 h-full w-full object-cover" />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--brand)]/70 via-[#123d2b]/70 to-[#123d2b]/85" style={company.coverUrl ? undefined : { backgroundImage: `linear-gradient(160deg, ${brand} 0%, #123d2b 85%)` }} />
        <div className="relative mx-auto flex max-w-7xl flex-col items-center px-4 py-16 text-center sm:px-6 sm:py-24">
          {company.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={company.logoUrl} alt={`Logo de ${company.tradeName}`} className="h-20 w-auto max-w-56 rounded-2xl bg-white/90 object-contain p-2 shadow-2xl" />
          ) : (
            <span className="flex size-20 items-center justify-center rounded-3xl bg-white/90 font-[family-name:var(--font-bricolage)] text-3xl font-black shadow-2xl" style={{ color: brand }}>{company.tradeName.charAt(0).toUpperCase()}</span>
          )}
          <h1 className="mt-6 max-w-3xl text-balance font-[family-name:var(--font-bricolage)] text-4xl font-extrabold leading-[0.95] tracking-tight text-white sm:text-6xl">{company.tradeName}</h1>
          {company.description && <p className="mt-4 max-w-2xl text-sm leading-6 text-white/85 sm:text-base">{company.description}</p>}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-[11px] font-semibold text-white/80">
            {cityLine && <span className="flex items-center gap-1.5"><MapPin className="size-3.5" />{cityLine}</span>}
            {company.hours && <span className="flex items-center gap-1.5"><Clock3 className="size-3.5" />{company.hours}</span>}
            {whatsappUrl && <a href={whatsappUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 underline underline-offset-2"><Phone className="size-3.5" />Fale conosco</a>}
          </div>
          <button type="button" onClick={scrollToMenu} className="mt-8 inline-flex h-13 items-center gap-2 rounded-2xl bg-[var(--brand)] px-7 font-[family-name:var(--font-bricolage)] text-sm font-black text-white shadow-[0_6px_0_rgba(0,0,0,0.25)] transition hover:-translate-y-0.5"><ShoppingBag className="size-4" />Ver cardápio<ChevronDown className="size-4" /></button>
        </div>
      </section>

      {/* Cardápio */}
      <div id="cardapio" className="mx-auto grid max-w-7xl items-start gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_360px]">
        <section className="scroll-mt-20">
          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="relative flex-1"><Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#123d2b]/40" /><span className="sr-only">Buscar produtos</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar no cardápio..." className="h-12 w-full rounded-2xl border border-[#123d2b]/15 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-[var(--brand)] focus:ring-4 focus:ring-[var(--brand)]/15" /></label>
            <div className="flex gap-2 overflow-x-auto pb-1">{categories.map((item) => <button type="button" key={item} onClick={() => setCategory(item)} className={`h-12 shrink-0 rounded-2xl px-4 text-xs font-bold transition ${category === item ? "text-white" : "border border-[#123d2b]/15 bg-white text-[#123d2b]/70"}`} style={category === item ? { backgroundColor: brand } : undefined}>{item}</button>)}</div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <article key={product.id} className="group flex flex-col overflow-hidden rounded-3xl border border-[#123d2b]/10 bg-white shadow-sm transition hover:shadow-lg">
                <div className="flex h-36 items-center justify-center bg-slate-50 bg-cover bg-center" style={product.imageUrl ? { backgroundImage: `url(${product.imageUrl})` } : undefined}>{!product.imageUrl && <Package className="size-8 text-[var(--brand)]/40" />}</div>
                <div className="flex flex-1 flex-col p-4">
                  <p className="text-[9px] font-black uppercase tracking-[0.16em]" style={{ color: brand }}>{product.category}</p>
                  <h2 className="mt-1 truncate font-[family-name:var(--font-bricolage)] text-sm font-bold text-[#123d2b]">{product.name}</h2>
                  <p className="mt-1 line-clamp-2 min-h-8 text-[10px] leading-4 text-[#123d2b]/55">{product.description || "Item disponível para pedido."}</p>
                  <div className="mt-3 flex items-center justify-between gap-3 border-t border-dashed border-[#123d2b]/15 pt-3">
                    <strong className="font-mono text-sm font-black" style={{ color: brand }}>{formatCurrency(product.price)}</strong>
                    {cart[product.id] ? (
                      <div className="flex items-center rounded-xl border p-1" style={{ borderColor: `color-mix(in srgb, ${brand} 40%, transparent)`, backgroundColor: `color-mix(in srgb, ${brand} 8%, white)` }}>
                        <button type="button" onClick={() => change(product.id, -1)} aria-label={`Diminuir ${product.name}`} className="flex size-8 items-center justify-center"><Minus className="size-3.5" /></button>
                        <span className="w-6 text-center font-mono text-xs font-black">{cart[product.id]}</span>
                        <button type="button" onClick={() => change(product.id, 1)} aria-label={`Aumentar ${product.name}`} className="flex size-8 items-center justify-center"><Plus className="size-3.5" /></button>
                      </div>
                    ) : (
                      <button type="button" onClick={() => change(product.id, 1)} className="flex h-9 items-center gap-1.5 rounded-xl px-3.5 text-[11px] font-black text-white transition hover:brightness-110" style={{ backgroundColor: brand }}><Plus className="size-3.5" />Adicionar</button>
                    )}
                  </div>
                </div>
              </article>
            ))}
            {!products.length && <div className="col-span-full rounded-2xl border border-dashed border-[#123d2b]/15 bg-white p-10 text-center text-xs text-[#123d2b]/45">Nenhum item encontrado.</div>}
          </div>
        </section>

        {/* Pedido — recibo da venda */}
        <aside className="rounded-3xl border-2 border-[#123d2b] bg-[#fff8ea] p-4 shadow-[6px_7px_0_rgba(0,0,0,0.08)] lg:sticky lg:top-20">
          <div className="flex items-center gap-3 border-b-2 border-dashed border-[#123d2b]/15 pb-3">
            <span className="flex size-10 items-center justify-center rounded-2xl text-white" style={{ backgroundColor: brand }}><ShoppingBag className="size-4" /></span>
            <div><h2 className="font-[family-name:var(--font-bricolage)] text-sm font-black text-[#123d2b]">Seu pedido</h2><p className="font-mono text-[9px] text-[#123d2b]/50">{cartItems.reduce((sum, item) => sum + item.quantity, 0)} item(ns)</p></div>
          </div>

          <div className="max-h-64 divide-y divide-dashed divide-[#123d2b]/10 overflow-y-auto">
            {cartItems.map(({ product, quantity }) => (
              <div key={product.id} className="flex items-center gap-2 py-3">
                <div className="min-w-0 flex-1"><p className="truncate text-xs font-bold text-[#123d2b]">{product.name}</p><p className="font-mono text-[9px] text-[#123d2b]/50">{quantity} × {formatCurrency(product.price)}</p></div>
                <strong className="font-mono text-xs text-[#123d2b]">{formatCurrency(product.price * quantity)}</strong>
                <button type="button" onClick={() => setCart((current) => { const next = { ...current }; delete next[product.id]; return next; })} aria-label={`Remover ${product.name}`} className="text-[#123d2b]/30 transition hover:text-red-500"><Trash2 className="size-3.5" /></button>
              </div>
            ))}
            {!cartItems.length && <p className="py-6 text-center font-mono text-[10px] text-[#123d2b]/45">Seu pedido está vazio.</p>}
          </div>

          <div className="flex justify-between border-t-2 border-dashed border-[#123d2b]/15 pt-3 font-mono text-sm font-black text-[#123d2b]"><span>Total</span><span>{formatCurrency(total)}</span></div>

          <form onSubmit={submit} className="mt-4 space-y-3">
            <input name="customerName" required minLength={3} placeholder="Seu nome" className={inputClass} />
            <input name="customerPhone" required inputMode="tel" placeholder="Telefone ou WhatsApp" className={inputClass} />
            <select name="fulfillment" required className={inputClass}>{company.pickupEnabled && <option value="PICKUP">Retirada no estabelecimento</option>}{company.deliveryEnabled && <option value="DELIVERY">Entrega a combinar</option>}</select>
            <textarea name="notes" rows={2} maxLength={500} placeholder="Observações (opcional)" className="w-full resize-none rounded-xl border border-[#123d2b]/15 bg-white p-3 font-sans text-xs text-[#123d2b] outline-none focus:border-[var(--brand)] focus:ring-4 focus:ring-[var(--brand)]/15" />
            {error && <div role="alert" className="rounded-xl bg-red-50 p-3 text-[10px] font-semibold text-red-700">{error}</div>}
            <button disabled={loading || !cartItems.length} className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl text-sm font-black text-white transition hover:brightness-110 disabled:opacity-50" style={{ backgroundColor: brand }}>{loading ? <LoaderCircle className="size-4 animate-spin" /> : <ShoppingBag className="size-4" />}Enviar pedido</button>
          </form>

          {confirmation && <div role="status" className="mt-4 rounded-2xl border border-green-200 bg-green-50 p-4 text-green-800"><CheckCircle2 className="size-5" /><p className="mt-2 text-xs font-black">Pedido {confirmation.code} recebido!</p><p className="mt-1 text-[10px] leading-4">Total de {formatCurrency(confirmation.total)}. A empresa entrará em contato para confirmar.</p></div>}
        </aside>
      </div>

      {/* Rodapé */}
      <footer className="border-t border-[#123d2b]/10 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-2 px-4 py-8 text-center sm:px-6">
          <p className="font-[family-name:var(--font-bricolage)] text-sm font-black" style={{ color: brand }}>{company.tradeName}</p>
          {company.hours && <p className="flex items-center gap-1.5 font-mono text-[10px] text-[#123d2b]/60"><Clock3 className="size-3.5" />{company.hours}</p>}
          {company.footerNote && <p className="text-[10px] text-[#123d2b]/55">{company.footerNote}</p>}
          {whatsappUrl && <a href={whatsappUrl} target="_blank" rel="noreferrer" className="mt-1 inline-flex h-10 items-center gap-2 rounded-xl px-4 text-[11px] font-bold text-white" style={{ backgroundColor: brand }}><Phone className="size-3.5" />Pedir pelo WhatsApp</a>}
          <p className="mt-4 font-mono text-[9px] text-[#123d2b]/40">Página criada com Mangora</p>
        </div>
      </footer>
    </main>
  );
}

const inputClass = "h-12 w-full rounded-xl border border-[#123d2b]/15 bg-white px-3.5 font-sans text-xs text-[#123d2b] outline-none placeholder:text-[#123d2b]/40 focus:border-[var(--brand)] focus:ring-4 focus:ring-[var(--brand)]/15";
