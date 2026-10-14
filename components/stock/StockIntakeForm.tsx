"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ArrowLeft, Barcode, LoaderCircle, PackagePlus, Save, Search, Upload } from "lucide-react";
import { useT } from "@/i18n/provider";
import { useProductForm } from "@/features/products/hooks/useProducts";
import { useReceiveStock, useStockOverview } from "@/features/stock/hooks/useStockOverview";
import type { Product } from "@/types/product";

const inputClass = "h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100";
const noProducts: Product[] = [];

export default function StockIntakeForm() {
  const t = useT();
  const router = useRouter();
  const { data: overview, isLoading: loadingProducts } = useStockOverview();
  const { data: productForm } = useProductForm(null);
  const receive = useReceiveStock();
  const products = overview?.products ?? noProducts;
  const categories = productForm?.categories ?? [];
  const [mode, setMode] = useState<"existing" | "new">("existing");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState("1");
  const [unitCost, setUnitCost] = useState("");
  const [supplier, setSupplier] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [newProduct, setNewProduct] = useState({ name: "", sku: "", barcode: "", category: "", price: "", minimumStock: "0" });
  const saving = receive.isPending;
  const matches = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("pt-BR");
    if (!normalized || selected) return [];
    return products.filter((product) => `${product.name} ${product.sku} ${product.barcode ?? ""}`.toLocaleLowerCase("pt-BR").includes(normalized)).slice(0, 8);
  }, [products, query, selected]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const amount = Number(quantity);
    if (!Number.isInteger(amount) || amount < 1) return setError(t("stock.intake.quantityError"));
    if (mode === "existing" && !selected) return setError(t("stock.intake.productError"));
    const newItem = mode === "new" ? {
      name: newProduct.name.trim(), sku: newProduct.sku.trim(), barcode: newProduct.barcode.trim() || undefined,
      category: newProduct.category.trim(), price: Number(newProduct.price), minimumStock: Number(newProduct.minimumStock || 0),
    } : undefined;
    if (newItem && (!newItem.name || !newItem.sku || !newItem.category || !Number.isFinite(newItem.price) || newItem.price <= 0)) return setError(t("stock.intake.newProductError"));
    try {
      const result = await receive.mutateAsync({
        ...(selected && mode === "existing" ? { productId: selected.id } : {}),
        ...(newItem ? { newProduct: newItem } : {}),
        quantity: amount,
        ...(unitCost.trim() ? { unitCost: Number(unitCost) } : {}),
        ...(supplier.trim() ? { supplier: supplier.trim() } : {}),
        ...(notes.trim() ? { notes: notes.trim() } : {}),
      });
      router.push(`/estoque?productId=${result.productId}&toast=${encodeURIComponent(t("stock.intake.success"))}`);
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t("stock.intake.failed"));
    }
  }

  const projected = selected ? selected.stock + (Number(quantity) || 0) : Number(quantity) || 0;

  return <section className="mx-auto max-w-5xl">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div className="flex items-start gap-3"><Link href="/estoque" aria-label={t("stock.intake.back")} className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-orange-600"><ArrowLeft className="size-4" /></Link><div><p className="text-[11px] font-bold uppercase tracking-[0.14em] text-orange-600">{t("stock.intake.eyebrow")}</p><h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">{t("stock.intake.title")}</h1><p className="mt-1 text-xs text-slate-500">{t("stock.intake.subtitle")}</p></div></div>
      <Link href="/dados" className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 hover:bg-slate-50"><Upload className="size-4" />{t("stock.intake.importCsv")}</Link>
    </div>

    <form onSubmit={submit} className="mt-5 grid items-start gap-4 lg:grid-cols-[1fr_300px]">
      <div className="space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex gap-2 border-b border-slate-100 pb-4">
            {(["existing", "new"] as const).map((choice) => <button key={choice} type="button" onClick={() => { setMode(choice); setSelected(null); setQuery(""); setError(""); }} aria-pressed={mode === choice} className={`h-10 rounded-xl px-4 text-xs font-bold ${mode === choice ? "bg-orange-50 text-orange-700 ring-1 ring-orange-200" : "text-slate-500 hover:bg-slate-50"}`}>{t(`stock.intake.mode.${choice}`)}</button>)}
          </div>
          {mode === "existing" ? <div className="mt-4">
            <label htmlFor="productSearch" className="mb-1.5 block text-xs font-bold text-slate-700">{t("stock.intake.product")}</label>
            <div className="relative"><Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><input id="productSearch" autoComplete="off" value={selected ? `${selected.name} · ${selected.sku}` : query} onChange={(event) => { const value = event.target.value; const barcodeMatch = products.find((product) => product.barcode && product.barcode.toLocaleLowerCase("pt-BR") === value.trim().toLocaleLowerCase("pt-BR")); setSelected(barcodeMatch ?? null); setQuery(barcodeMatch ? "" : value); }} placeholder={t("stock.intake.searchPlaceholder")} className={`${inputClass} pl-10`} />{!selected && query && <Barcode className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />}</div>
            {matches.length > 0 && <ul className="mt-2 max-h-64 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg">{matches.map((product) => <li key={product.id}><button type="button" onClick={() => { setSelected(product); setQuery(""); }} className="flex w-full items-center justify-between gap-3 px-3.5 py-3 text-left hover:bg-orange-50"><span className="min-w-0"><span className="block truncate text-xs font-bold text-slate-800">{product.name}</span><span className="mt-1 block text-[10px] text-slate-400">SKU {product.sku}{product.barcode ? ` · ${product.barcode}` : ""}</span></span><span className="shrink-0 text-[10px] font-bold text-slate-500">{t("stock.intake.currentStock", { count: product.stock })}</span></button></li>)}</ul>}
            {!loadingProducts && !products.length && <p className="mt-3 text-xs text-slate-500">{t("stock.intake.noProducts")} <button type="button" onClick={() => setMode("new")} className="font-bold text-orange-700 underline">{t("stock.intake.mode.new")}</button></p>}
            {selected && <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-50 px-3.5 py-3"><span className="min-w-0"><span className="block truncate text-xs font-bold text-slate-800">{selected.name}</span><span className="mt-1 text-[10px] text-slate-500">{t("stock.intake.currentStock", { count: selected.stock })}</span></span><button type="button" onClick={() => { setSelected(null); setQuery(""); }} className="text-xs font-bold text-orange-700 underline">{t("stock.intake.changeProduct")}</button></div>}
          </div> : <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label={t("stock.intake.fields.name")}><input required minLength={2} maxLength={160} value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} className={inputClass} /></Field>
            <Field label={t("stock.intake.fields.sku")}><input required minLength={2} maxLength={64} value={newProduct.sku} onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })} className={inputClass} /></Field>
            <Field label={t("stock.intake.fields.category")}><input required list="stock-intake-categories" value={newProduct.category} onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })} className={inputClass} /><datalist id="stock-intake-categories">{categories.map((item) => <option key={item.id} value={item.name} />)}</datalist></Field>
            <Field label={t("stock.intake.fields.salePrice")}><input required type="number" min="0.01" step="0.01" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} className={inputClass} /></Field>
            <Field label={t("stock.intake.fields.barcode")}><input maxLength={64} value={newProduct.barcode} onChange={(e) => setNewProduct({ ...newProduct, barcode: e.target.value })} className={inputClass} /></Field>
            <Field label={t("stock.intake.fields.minimumStock")}><input type="number" min="0" step="1" value={newProduct.minimumStock} onChange={(e) => setNewProduct({ ...newProduct, minimumStock: e.target.value })} className={inputClass} /></Field>
          </div>}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"><h2 className="text-sm font-bold text-slate-950">{t("stock.intake.entryDetails")}</h2><div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label={t("stock.intake.fields.quantity")}><input required autoFocus={mode === "existing" && Boolean(selected)} type="number" min="1" step="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} className={inputClass} /></Field>
          <Field label={t("stock.intake.fields.unitCost")}><input type="number" min="0" step="0.01" value={unitCost} onChange={(e) => setUnitCost(e.target.value)} placeholder="0,00" className={inputClass} /></Field>
          <Field label={t("stock.intake.fields.supplier")}><input maxLength={160} value={supplier} onChange={(e) => setSupplier(e.target.value)} placeholder={t("stock.intake.fields.optional")} className={inputClass} /></Field>
          <Field label={t("stock.intake.fields.notes")}><input maxLength={1000} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t("stock.intake.fields.optional")} className={inputClass} /></Field>
        </div></div>
        {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">{error}</div>}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><Link href="/estoque" className="flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-600">{t("stock.intake.cancel")}</Link><button type="submit" disabled={saving || loadingProducts} className="flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 px-5 text-sm font-bold text-white shadow-lg shadow-orange-200 disabled:opacity-60">{saving ? <LoaderCircle className="size-4 animate-spin" /> : <Save className="size-4" />}{t("stock.intake.save")}</button></div>
      </div>
      <aside className="rounded-2xl border border-orange-100 bg-orange-50/60 p-5 lg:sticky lg:top-20"><div className="flex size-10 items-center justify-center rounded-xl bg-orange-100 text-orange-700"><PackagePlus className="size-5" /></div><h2 className="mt-4 text-sm font-black text-slate-900">{t("stock.intake.preview")}</h2><p className="mt-1 text-xs text-slate-500">{t("stock.intake.previewHint")}</p><div className="mt-4 rounded-xl bg-white p-4"><p className="text-[10px] font-semibold text-slate-400">{selected?.name || (mode === "new" ? newProduct.name : t("stock.intake.noSelection"))}</p><p className="mt-2 text-3xl font-black tracking-tight text-orange-700">{projected}</p><p className="text-[10px] text-slate-500">{t("stock.intake.unitsAfter")}</p>{selected && <p className="mt-2 border-t border-slate-100 pt-2 text-[10px] text-slate-400">{t("stock.intake.currentStock", { count: selected.stock })} + {Number(quantity) || 0}</p>}</div><p className="mt-4 text-[10px] leading-5 text-slate-500">{t("stock.intake.historyNote")}</p></aside>
    </form>
  </section>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label><span className="mb-1.5 block text-xs font-bold text-slate-700">{label}</span>{children}</label>; }
