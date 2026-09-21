"use client";

import { useState, type CSSProperties } from "react";
import Link from "next/link";
import { Barcode, Check, LoaderCircle, Printer, Ruler, Search, Trash2 } from "lucide-react";
import { useProducts } from "@/features/products/hooks/useProducts";
import { useT } from "@/i18n/provider";
import { barcodeFits, buildLabelDocument, LABEL_CSS, LABEL_SIZES, labelCode, labelMarkup, MAX_LABELS, printLabels, validLabelSize, type LabelItem, type LabelPaper } from "@/lib/labels";

const inputClass = "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100";
const panelClass = "rounded-2xl border border-slate-200 bg-white p-4 sm:p-5";

export default function LabelWorkspace() {
  const t = useT();
  const { data: products = [], isLoading, error, refetch } = useProducts();
  const [search, setSearch] = useState("");
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [preset, setPreset] = useState("50x50");
  const [width, setWidth] = useState("5");
  const [height, setHeight] = useState("5");
  const [paper, setPaper] = useState<LabelPaper>("roll");
  const [printing, setPrinting] = useState(false);
  const [printError, setPrintError] = useState("");
  const size = { width: Number(width) * 10, height: Number(height) * 10 };
  const validSize = validLabelSize(size);
  const selected: LabelItem[] = products.flatMap((product) => {
    const code = labelCode(product);
    return quantities[product.id] !== undefined && code ? [{ id: product.id, name: product.name, code, quantity: quantities[product.id] }] : [];
  });
  const total = selected.reduce((sum, item) => sum + item.quantity, 0);
  const invalidQuantity = selected.some((item) => !Number.isInteger(item.quantity) || item.quantity < 1);
  const tooNarrow = validSize && selected.some((item) => !barcodeFits(item.code, size.width));
  const canPrint = selected.length > 0 && validSize && !invalidQuantity && total <= MAX_LABELS && !tooNarrow && !printing && !error;
  const visible = products.filter((product) => `${product.name} ${product.sku} ${product.barcode ?? ""}`.toLocaleLowerCase().includes(search.toLocaleLowerCase()));
  const preview = selected[0];
  const previewMarkup = preview ? labelMarkup(preview) : "";
  const dimensions = { "--label-width": `${validSize ? size.width : 50}mm`, "--label-height": `${validSize ? size.height : 50}mm` } as CSSProperties;

  function chooseSize(value: string) {
    setPreset(value);
    if (value === "custom") return;
    const [nextWidth, nextHeight] = value.split("x").map(Number);
    setWidth(String(nextWidth / 10));
    setHeight(String(nextHeight / 10));
  }

  function toggle(id: string) {
    setQuantities((current) => {
      const next = { ...current };
      if (next[id] !== undefined) delete next[id];
      else next[id] = 1;
      return next;
    });
  }

  async function handlePrint() {
    if (!canPrint) return;
    setPrinting(true);
    setPrintError("");
    try {
      await printLabels(buildLabelDocument(selected, size, paper, t("labels.title")));
    } catch {
      setPrintError(t("labels.printError"));
    } finally {
      setPrinting(false);
    }
  }

  return (
    <section className="mx-auto max-w-7xl">
      <style>{LABEL_CSS}</style>
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-orange-600">{t("navigation.groups.supplies")}</p>
          <h1 className="mt-1 flex items-center gap-2 text-2xl font-black text-slate-950 sm:text-3xl"><Barcode className="size-7 text-orange-600" />{t("labels.title")}</h1>
          <p className="mt-2 max-w-xl text-sm text-slate-500">{t("labels.subtitle")}</p>
        </div>
        <button type="button" onClick={() => void handlePrint()} disabled={!canPrint} className="flex h-11 items-center gap-2 rounded-xl bg-orange-600 px-5 text-sm font-bold text-white hover:bg-orange-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 disabled:cursor-not-allowed disabled:opacity-40">
          {printing ? <LoaderCircle className="size-4 animate-spin" /> : <Printer className="size-4" />}{t("labels.print", { count: total })}
        </button>
      </header>

      <div className="mt-6 grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.85fr)]">
        <div className="space-y-5">
          <div className={panelClass}>
            <h2 className="text-sm font-bold text-slate-900">{t("labels.products")}</h2>
            <label className="relative mt-3 block"><Search className="absolute left-3 top-3.5 size-4 text-slate-400" /><span className="sr-only">{t("labels.search")}</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t("labels.search")} className={`${inputClass} pl-9`} /></label>
            <div className="mt-3 max-h-72 divide-y divide-slate-100 overflow-y-auto">
              {isLoading && <p role="status" className="py-6 text-center text-sm text-slate-500">{t("labels.loading")}</p>}
              {error && <div role="alert" className="py-4 text-sm text-red-700">{t("labels.loadError")} <button onClick={() => void refetch()} className="font-bold underline">{t("labels.retry")}</button></div>}
              {!isLoading && !error && !visible.length && <p className="py-6 text-center text-sm text-slate-500">{t("labels.noProducts")}</p>}
              {visible.map((product) => {
                const code = labelCode(product);
                const checked = quantities[product.id] !== undefined;
                return <div key={product.id} className="flex items-center gap-3 py-3">
                  <input type="checkbox" checked={checked} disabled={!code} onChange={() => toggle(product.id)} aria-label={t("labels.selectProduct", { name: product.name })} className="size-4 shrink-0 accent-orange-600" />
                  <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-800" title={product.name}>{product.name}</p><p className="mt-0.5 text-xs text-slate-500">{code ?? t("labels.missingCode")}</p></div>
                  {!code ? <Link href={`/produtos?acao=editar&id=${encodeURIComponent(product.id)}`} className="shrink-0 text-xs font-bold text-orange-700 underline">{t("labels.edit")}</Link> : checked && <Check className="size-4 shrink-0 text-orange-600" />}
                </div>;
              })}
            </div>
            <p className="mt-3 border-t border-slate-100 pt-3 text-xs leading-5 text-slate-500">{t("labels.codeHint")}</p>
          </div>

          <div className={panelClass}>
            <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900"><Ruler className="size-4 text-orange-600" />{t("labels.dimensions")}</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="space-y-1.5 text-xs font-semibold text-slate-600"><span>{t("labels.size")}</span><select value={preset} onChange={(event) => chooseSize(event.target.value)} className={inputClass}>{LABEL_SIZES.map((item) => <option key={`${item.width}x${item.height}`} value={`${item.width}x${item.height}`}>{item.width / 10} × {item.height / 10} cm</option>)}<option value="custom">{t("labels.custom")}</option></select></label>
              <label className="space-y-1.5 text-xs font-semibold text-slate-600"><span>{t("labels.paper")}</span><select value={paper} onChange={(event) => setPaper(event.target.value as LabelPaper)} className={inputClass}><option value="roll">{t("labels.roll")}</option><option value="a4">{t("labels.a4")}</option></select></label>
              {preset === "custom" && <>
                <label className="space-y-1.5 text-xs font-semibold text-slate-600"><span>{t("labels.width")}</span><input type="number" min="3" max="20" step="0.1" value={width} onChange={(event) => setWidth(event.target.value)} className={inputClass} /></label>
                <label className="space-y-1.5 text-xs font-semibold text-slate-600"><span>{t("labels.height")}</span><input type="number" min="2" max="20" step="0.1" value={height} onChange={(event) => setHeight(event.target.value)} className={inputClass} /></label>
              </>}
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-500">{paper === "a4" ? t("labels.a4Hint") : t("labels.rollHint")}</p>
            {!validSize && <p role="alert" className="mt-3 text-xs font-semibold text-red-700">{t("labels.invalidSize")}</p>}
          </div>

          {selected.length > 0 && <div className={panelClass}>
            <div className="flex items-center justify-between gap-3"><h2 className="text-sm font-bold">{t("labels.queue")}</h2><button onClick={() => setQuantities({})} className="text-xs font-semibold text-slate-500 underline">{t("labels.clear")}</button></div>
            <div className="mt-3 divide-y divide-slate-100">{selected.map((item) => <div key={item.id} className="flex items-center gap-3 py-3">
              <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold" title={item.name}>{item.name}</p><p className="text-xs text-slate-500">{item.code}</p></div>
              <label className="w-20 shrink-0"><span className="sr-only">{t("labels.quantity", { name: item.name })}</span><input type="number" min="1" max={MAX_LABELS} step="1" value={item.quantity || ""} onChange={(event) => setQuantities((current) => ({ ...current, [item.id]: Number(event.target.value) }))} className={inputClass} /></label>
              <button onClick={() => toggle(item.id)} aria-label={t("labels.remove", { name: item.name })} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"><Trash2 className="size-4" /></button>
            </div>)}</div>
            <p className="mt-3 border-t pt-3 text-xs font-semibold text-slate-600" aria-live="polite">{t("labels.total", { count: total })}</p>
          </div>}
        </div>

        <aside className="min-w-0 lg:sticky lg:top-5">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-5 py-4"><h2 className="text-sm font-bold">{t("labels.preview")}</h2><span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-xs text-slate-600">{validSize ? `${width} × ${height} cm` : "—"}</span></div>
            <div className="flex min-h-80 items-center overflow-auto p-8" style={{ backgroundImage: "radial-gradient(#cbd5e1 1px, transparent 1px)", backgroundSize: "12px 12px" }}>
              {preview ? <div className="mx-auto shrink-0 shadow-lg ring-1 ring-black/5" style={dimensions} dangerouslySetInnerHTML={{ __html: previewMarkup }} /> : <div className="mx-auto max-w-60 text-center"><Barcode className="mx-auto size-12 text-slate-300" /><p className="mt-3 text-sm leading-6 text-slate-500">{t("labels.emptyPreview")}</p></div>}
            </div>
            <p className="border-t border-slate-200 bg-white px-5 py-3 text-xs leading-5 text-slate-500">{t("labels.previewHint")}</p>
          </div>
          <p className="mt-4 text-xs leading-5 text-slate-500">{t("labels.printHint")}</p>
          {(invalidQuantity || total > MAX_LABELS) && <p role="alert" className="mt-3 rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-700">{t("labels.quantityError", { max: MAX_LABELS })}</p>}
          {tooNarrow && <p role="alert" className="mt-3 rounded-xl bg-amber-50 p-3 text-xs font-semibold text-amber-800">{t("labels.narrowError")}</p>}
          {printError && <p role="alert" className="mt-3 text-xs font-semibold text-red-700">{printError}</p>}
        </aside>
      </div>
    </section>
  );
}
