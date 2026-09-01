"use client";

import { FormEvent, useMemo, useState, type CSSProperties } from "react";
import { AtSign, CheckCircle2, ChevronDown, Clock3, LoaderCircle, MapPin, Minus, Package, Phone, Plus, Search, ShoppingBag, Trash2 } from "lucide-react";
import type { PublicStore } from "@/types/public-store";
import { formatCurrency } from "@/lib/format";
import { useCreatePublicOrder, type PublicOrderConfirmation } from "@/features/public-store/hooks/usePublicStore";

type Cart = Record<string, number>;

/** Página de vendas v2 — identidade total do cliente + tema claro/escuro. */
export default function PublicStorefront({ store }: { store: PublicStore }) {
  const createOrder = useCreatePublicOrder();
  const loading = createOrder.isPending;
  const [cart, setCart] = useState<Cart>({});
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Todos");
  const [error, setError] = useState("");
  const [confirmation, setConfirmation] = useState<PublicOrderConfirmation | null>(null);

  const company = store.company;
  const dark = company.theme === "dark";
  const brand = company.brandColor || "#ff6b1a";
  const categories = useMemo(() => ["Todos", ...new Set(store.products.map((product) => product.category))], [store.products]);
  const products = store.products.filter((product) => (category === "Todos" || product.category === category) && (!search.trim() || `${product.name} ${product.description ?? ""}`.toLocaleLowerCase("pt-BR").includes(search.trim().toLocaleLowerCase("pt-BR"))));
  const cartItems = store.products.filter((product) => cart[product.id]).map((product) => ({ product, quantity: cart[product.id] }));
  const total = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const whatsappDigits = (company.whatsapp || company.phone || "").replace(/\D/g, "");
  const whatsappUrl = whatsappDigits ? `https://wa.me/55${whatsappDigits}` : null;
  const instagramHandle = company.instagram ? company.instagram.replace(/^@/, "") : null;
  const instagramUrl = instagramHandle ? `https://instagram.com/${instagramHandle}` : null;
  const cityLine = [company.city, company.state].filter(Boolean).join(" - ");

  const defaults = dark
    ? { bg: "#12141b", panel: "#1b1e26", panel2: "#232833", ink: "#f2f4f8", muted: "rgba(242,244,248,0.62)", line: "rgba(255,255,255,0.12)" }
    : { bg: "#fffdf8", panel: "#ffffff", panel2: "#fff8ea", ink: "#123d2b", muted: "rgba(18,61,43,0.58)", line: "rgba(18,61,43,0.14)" };
  const titleColor = company.titleColor || defaults.ink;
  const vars = {
    "--brand": brand,
    "--title": titleColor,
    "--bg": company.backgroundColor || defaults.bg,
    "--panel": company.panelColor || defaults.panel,
    "--panel-2": defaults.panel2,
    "--ink": company.textColor || defaults.ink,
    "--muted": defaults.muted,
    "--line": defaults.line,
  } as CSSProperties;

  function change(productId: string, delta: number) {
    const product = store.products.find((item) => item.id === productId); if (!product) return;
    setCart((current) => { const next = Math.max(0, Math.min((current[productId] ?? 0) + delta, product.available ?? 99)); const updated = { ...current }; if (next) updated[productId] = next; else delete updated[productId]; return updated; });
    setConfirmation(null); setError("");
  }

  function scrollToId(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
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
    <main className="mangora-public min-h-screen bg-[var(--bg)] font-[family-name:var(--font-manrope)] text-[var(--ink)] transition-colors" style={vars}>
      {company.announcement && (
        <div className="bg-[var(--brand)] px-4 py-2 text-center text-[11px] font-bold text-white">{company.announcement}</div>
      )}

      <header className="sticky top-0 z-30 border-b border-[var(--line)] bg-[var(--bg)]/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
          <button type="button" onClick={() => scrollToId("cardapio")} className="flex min-w-0 shrink items-center gap-2.5 text-left" aria-label={`Voltar ao cardápio de ${company.tradeName}`}>
            {company.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={company.logoUrl} alt={`Logo de ${company.tradeName}`} className="h-9 w-auto max-w-28 object-contain sm:max-w-36" />
            ) : (
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl font-[family-name:var(--font-bricolage)] text-base font-black text-white" style={{ backgroundColor: brand }}>{company.tradeName.charAt(0).toUpperCase()}</span>
            )}
            <span className="min-w-0">
              <span className="block truncate font-[family-name:var(--font-bricolage)] text-sm font-black leading-tight text-[var(--title)]">{company.tradeName}</span>
              <span className="block font-mono text-[9px] uppercase tracking-[0.14em] text-[var(--muted)]">Página online</span>
            </span>
          </button>
          <div className="flex shrink-0 items-center gap-2">
            {whatsappUrl && <a href={whatsappUrl} target="_blank" rel="noreferrer" className="flex h-9 items-center gap-1.5 rounded-xl px-3 text-[10px] font-black text-white transition hover:brightness-110" style={{ backgroundColor: brand }}><Phone className="size-3.5" /><span className="hidden sm:inline">WhatsApp</span></a>}
          </div>
        </div>
      </header>

      {/* Hero — identidade do cliente */}
      <section className="relative overflow-hidden">
        {company.coverUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={company.coverUrl} alt={`Capa de ${company.tradeName}`} className="absolute inset-0 h-full w-full object-cover" />
        )}
        <div className="absolute inset-0" style={company.coverUrl ? { backgroundImage: `linear-gradient(180deg, rgba(10,20,16,0.35) 0%, rgba(10,20,16,0.82) 100%)` } : { backgroundImage: `linear-gradient(155deg, ${brand} 0%, #123d2b 78%)` }} />
        <div className="relative mx-auto flex max-w-7xl flex-col items-center px-4 py-16 text-center sm:px-6 sm:py-24">
          {company.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={company.logoUrl} alt={`Logo de ${company.tradeName}`} className="h-24 w-auto max-w-60 rounded-3xl bg-white/95 object-contain p-2.5 shadow-2xl" />
          ) : (
            <span className="flex size-24 items-center justify-center rounded-[1.75rem] bg-white/95 font-[family-name:var(--font-bricolage)] text-4xl font-black shadow-2xl" style={{ color: brand }}>{company.tradeName.charAt(0).toUpperCase()}</span>
          )}
          <h1 className="mt-7 max-w-3xl text-balance font-[family-name:var(--font-bricolage)] text-5xl font-extrabold leading-[0.95] tracking-tight sm:text-6xl" style={{ color: company.titleColor || "#ffffff" }}>{company.tradeName}</h1>
          {company.tagline && <p className="mt-4 max-w-2xl text-lg font-semibold text-white/90">{company.tagline}</p>}
          {company.description && <p className="mt-2 max-w-2xl text-sm leading-6 text-white/75">{company.description}</p>}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-[11px] font-semibold text-white/85">
            {cityLine && <span className="flex items-center gap-1.5"><MapPin className="size-3.5" />{cityLine}</span>}
            {company.hours && <span className="flex items-center gap-1.5"><Clock3 className="size-3.5" />{company.hours}</span>}
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button type="button" onClick={() => scrollToId("cardapio")} className="inline-flex h-13 items-center gap-2 rounded-2xl bg-[var(--brand)] px-8 font-[family-name:var(--font-bricolage)] text-sm font-black text-white shadow-[0_6px_0_rgba(0,0,0,0.25)] transition hover:-translate-y-0.5 hover:brightness-110"><ShoppingBag className="size-4" />Ver cardápio<ChevronDown className="size-4" /></button>
            {whatsappUrl && <a href={whatsappUrl} target="_blank" rel="noreferrer" className="inline-flex h-13 items-center gap-2 rounded-2xl border-2 border-white/60 px-6 text-sm font-bold text-white transition hover:bg-white/10"><Phone className="size-4" />Pedir no WhatsApp</a>}
          </div>
        </div>
      </section>

      {/* Cardápio */}
      <div id="cardapio" className="mx-auto grid max-w-7xl scroll-mt-16 items-start gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_360px]">
        <section>
          <div className="sticky top-16 z-20 -mx-4 space-y-3 bg-[var(--bg)]/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-3xl sm:px-4">
            <label className="relative block"><Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[var(--muted)]" /><span className="sr-only">Buscar produtos</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar no cardápio..." className="h-12 w-full rounded-2xl border border-[var(--line)] bg-[var(--panel)] pl-10 pr-4 text-sm text-[var(--ink)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--brand)] focus:ring-4 focus:ring-[var(--brand)]/15" /></label>
            <div className="flex gap-2 overflow-x-auto pb-0.5">{categories.map((item) => <button type="button" key={item} onClick={() => setCategory(item)} className={`h-10 shrink-0 rounded-2xl px-4 text-xs font-bold transition ${category === item ? "text-white" : "border border-[var(--line)] bg-[var(--panel)] text-[var(--muted)]"}`} style={category === item ? { backgroundColor: brand } : undefined}>{item}</button>)}</div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => {
              const soldOut = product.available === 0;
              return (
                <article key={product.id} className={`group flex flex-col overflow-hidden rounded-3xl border border-[var(--line)] bg-[var(--panel)] shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg ${soldOut ? "opacity-80" : ""}`}>
                  <div className="relative flex h-40 items-center justify-center bg-[var(--panel-2)] bg-cover bg-center" style={product.imageUrl ? { backgroundImage: `url(${product.imageUrl})` } : undefined}>
                    {!product.imageUrl && <Package className="size-9 text-[var(--brand)]/40" />}
                    {soldOut && <span className="absolute left-3 top-3 rounded-full bg-[#123d2b] px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-white">Esgotado</span>}
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <p className="text-[9px] font-black uppercase tracking-[0.16em]" style={{ color: brand }}>{product.category}</p>
                    <h2 className="mt-1 truncate font-[family-name:var(--font-bricolage)] text-sm font-bold">{product.name}</h2>
                    <p className="mt-1 line-clamp-2 min-h-8 text-[10px] leading-4 text-[var(--muted)]">{product.description || "Item disponível para pedido."}</p>
                    <div className="mt-3 flex items-center justify-between gap-3 border-t border-dashed border-[var(--line)] pt-3">
                      <strong className="font-mono text-base font-black" style={{ color: brand }}>{formatCurrency(product.price)}</strong>
                      {soldOut ? (
                        <span className="rounded-xl bg-[var(--line)] px-3.5 py-2 text-[10px] font-bold text-[var(--muted)]">Indisponível</span>
                      ) : cart[product.id] ? (
                        <div className="flex items-center rounded-xl border p-1" style={{ borderColor: `color-mix(in srgb, ${brand} 40%, transparent)`, backgroundColor: `color-mix(in srgb, ${brand} 8%, ${dark ? "#1b1e26" : "white"})` }}>
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
              );
            })}
            {!products.length && <div className="col-span-full rounded-2xl border border-dashed border-[var(--line)] bg-[var(--panel)] p-10 text-center text-xs text-[var(--muted)]">Nenhum item encontrado.</div>}
          </div>
        </section>

        {/* Pedido — recibo */}
        <aside id="pedido" className="scroll-mt-20 rounded-3xl border-2 border-[var(--line)] bg-[var(--panel-2)] p-4 shadow-lg lg:sticky lg:top-20">
          <div className="flex items-center gap-3 border-b-2 border-dashed border-[var(--line)] pb-3">
            <span className="flex size-10 items-center justify-center rounded-2xl text-white" style={{ backgroundColor: brand }}><ShoppingBag className="size-4" /></span>
            <div><h2 className="font-[family-name:var(--font-bricolage)] text-sm font-black">Seu pedido</h2><p className="font-mono text-[9px] text-[var(--muted)]">{itemCount} item(ns)</p></div>
          </div>

          <div className="max-h-64 divide-y divide-dashed divide-[var(--line)] overflow-y-auto">
            {cartItems.map(({ product, quantity }) => (
              <div key={product.id} className="flex items-center gap-2 py-3">
                <div className="min-w-0 flex-1"><p className="truncate text-xs font-bold">{product.name}</p><p className="font-mono text-[9px] text-[var(--muted)]">{quantity} × {formatCurrency(product.price)}</p></div>
                <strong className="font-mono text-xs">{formatCurrency(product.price * quantity)}</strong>
                <button type="button" onClick={() => setCart((current) => { const next = { ...current }; delete next[product.id]; return next; })} aria-label={`Remover ${product.name}`} className="text-[var(--muted)] transition hover:text-red-500"><Trash2 className="size-3.5" /></button>
              </div>
            ))}
            {!cartItems.length && <p className="py-6 text-center font-mono text-[10px] text-[var(--muted)]">Seu pedido está vazio.</p>}
          </div>

          <div className="flex justify-between border-t-2 border-dashed border-[var(--line)] pt-3 font-mono text-sm font-black"><span>Total</span><span>{formatCurrency(total)}</span></div>

          <form onSubmit={submit} className="mt-4 space-y-3">
            <input name="customerName" required minLength={3} placeholder="Seu nome" className={inputClass} />
            <input name="customerPhone" required inputMode="tel" placeholder="Telefone ou WhatsApp" className={inputClass} />
            <select name="fulfillment" required className={inputClass}>{company.pickupEnabled && <option value="PICKUP">Retirada no estabelecimento</option>}{company.deliveryEnabled && <option value="DELIVERY">Entrega a combinar</option>}</select>
            <textarea name="notes" rows={2} maxLength={500} placeholder="Observações (opcional)" className="w-full resize-none rounded-xl border border-[var(--line)] bg-[var(--panel)] p-3 text-xs text-[var(--ink)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--brand)] focus:ring-4 focus:ring-[var(--brand)]/15" />
            {error && <div role="alert" className="rounded-xl bg-red-50 p-3 text-[10px] font-semibold text-red-700">{error}</div>}
            <button disabled={loading || !cartItems.length} className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl text-sm font-black text-white transition hover:brightness-110 disabled:opacity-50" style={{ backgroundColor: brand }}>{loading ? <LoaderCircle className="size-4 animate-spin" /> : <ShoppingBag className="size-4" />}Enviar pedido</button>
          </form>

          {confirmation && <div role="status" className="mt-4 rounded-2xl border border-green-200 bg-green-50 p-4 text-green-800"><CheckCircle2 className="size-5" /><p className="mt-2 text-xs font-black">Pedido {confirmation.code} recebido!</p><p className="mt-1 text-[10px] leading-4">{company.orderNote || `Total de ${formatCurrency(confirmation.total)}. A empresa entrará em contato para confirmar.`}</p></div>}
        </aside>
      </div>

      {/* Rodapé */}
      <footer className="border-t border-[var(--line)] bg-[var(--panel)]">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-2 px-4 py-8 text-center sm:px-6">
          <p className="font-[family-name:var(--font-bricolage)] text-sm font-black text-[var(--title)]">{company.tradeName}</p>
          {company.hours && <p className="flex items-center gap-1.5 font-mono text-[10px] text-[var(--muted)]"><Clock3 className="size-3.5" />{company.hours}</p>}
          {company.footerNote && <p className="text-[10px] text-[var(--muted)]">{company.footerNote}</p>}
          <div className="mt-1 flex flex-wrap items-center justify-center gap-2">
            {whatsappUrl && <a href={whatsappUrl} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center gap-2 rounded-xl px-4 text-[11px] font-bold text-white" style={{ backgroundColor: brand }}><Phone className="size-3.5" />Pedir pelo WhatsApp</a>}
            {instagramUrl && <a href={instagramUrl} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center gap-2 rounded-xl border border-[var(--line)] px-4 text-[11px] font-bold text-[var(--ink)] transition hover:border-[var(--brand)]"><AtSign className="size-3.5" />@{instagramHandle}</a>}
          </div>
          <p className="mt-4 font-mono text-[9px] text-[var(--muted)]">Página criada com Mangora</p>
        </div>
      </footer>

      {/* Barra mobile de pedido */}
      {itemCount > 0 && !confirmation && (
        <button type="button" onClick={() => scrollToId("pedido")} className="fixed inset-x-4 bottom-4 z-40 flex h-13 items-center justify-between rounded-2xl px-5 text-sm font-black text-white shadow-2xl lg:hidden" style={{ backgroundColor: brand }}>
          <span className="flex items-center gap-2"><ShoppingBag className="size-4" />{itemCount} item(ns)</span>
          <span className="font-mono">{formatCurrency(total)}</span>
        </button>
      )}
    </main>
  );
}

const inputClass = "h-12 w-full rounded-xl border border-[var(--line)] bg-[var(--panel)] px-3.5 text-xs text-[var(--ink)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--brand)] focus:ring-4 focus:ring-[var(--brand)]/15";
