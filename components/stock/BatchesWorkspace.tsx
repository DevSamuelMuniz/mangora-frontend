"use client";

import { useMemo, useState } from "react";
import { Boxes, LoaderCircle, Plus, ShieldAlert } from "lucide-react";

import { useProductForm, useProducts, useSaveProduct } from "@/features/products/hooks/useProducts";
import { useCreateBatch, useProductBatches } from "@/features/stock/hooks/useInventoryBatches";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Product } from "@/types/product";

export default function BatchesWorkspace() {
  const { data: products = [], isLoading } = useProducts();
  const trackStock = useMemo(() => products.filter((product) => product.trackStock && product.active), [products]);
  const [productId, setProductId] = useState<string>("");
  const { data: batches = [], isLoading: batchesLoading } = useProductBatches(productId || null);
  const { data: form } = useProductForm(productId || null);
  const saveProduct = useSaveProduct();
  const createBatch = useCreateBatch();
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formState, setFormState] = useState({ code: "", quantity: "", unitCost: "", expiresAt: "" });
  const [now] = useState(() => Date.now());

  const costMethod = (form?.product as unknown as { costMethod?: "AVERAGE" | "FIFO" } | undefined)?.costMethod ?? "AVERAGE";
  const product = products.find((item) => item.id === productId);

  async function switchToFifo() {
    if (!productId) return;
    try {
      setError("");
      await saveProduct.mutateAsync({ id: productId, payload: { costMethod: "FIFO" } });
      setNotice("Produto agora usa custo FIFO — as vendas baixam por lote.");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Não foi possível ativar o custo FIFO.");
    }
  }

  async function submitBatch(event: React.FormEvent) {
    event.preventDefault();
    if (!productId) return;
    const quantity = Math.trunc(Number(formState.quantity));
    const unitCost = Number(formState.unitCost);
    if (!Number.isFinite(quantity) || quantity <= 0 || !Number.isFinite(unitCost) || unitCost < 0) {
      setError("Informe quantidade maior que zero e um custo unitário válido.");
      return;
    }
    try {
      setError("");
      await createBatch.mutateAsync({
        productId,
        code: formState.code.trim(),
        quantity,
        unitCost,
        expiresAt: formState.expiresAt ? new Date(`${formState.expiresAt}T12:00:00.000Z`).toISOString() : undefined,
      });
      setShowForm(false);
      setFormState({ code: "", quantity: "", unitCost: "", expiresAt: "" });
      setNotice("Lote recebido — estoque atualizado com entrada justificada.");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Não foi possível receber o lote.");
    }
  }

  const nearExpiry = batches.filter((batch) => batch.expiresAt && new Date(batch.expiresAt).getTime() - now < 90 * 86_400_000);

  return (
    <section className="mx-auto max-w-5xl">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-orange-600">Estoque · Custo &amp; validade</p>
        <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">Lotes e custo FIFO</h1>
        <p className="mt-1 text-xs text-slate-500">Cadastre lotes com custo e validade; produtos FIFO baixam por lote na venda.</p>
      </div>

      {notice && <div role="status" className="mt-4 flex items-center justify-between rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-xs font-semibold text-green-700"><span>{notice}</span><button type="button" onClick={() => setNotice("")} className="font-bold underline">Fechar</button></div>}
      {error && <div role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">{error}</div>}

      <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <label className="block text-xs font-bold text-slate-700">Produto com controle de estoque{isLoading ? <LoaderCircle className="ml-2 inline size-3.5 animate-spin text-orange-600" /> : null}<select value={productId} onChange={(event) => { setProductId(event.target.value); setShowForm(false); }} className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm outline-none focus:border-orange-300 focus:ring-4 focus:ring-orange-100"><option value="">Selecione um produto...</option>{trackStock.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.sku}</option>)}</select></label>

        {product && (
          <div className="mt-4">
            <div className={`flex flex-col gap-3 rounded-xl p-3 sm:flex-row sm:items-center sm:justify-between ${costMethod === "FIFO" ? "bg-green-50/70" : "border border-amber-200 bg-amber-50/60"}`}>
              <div className="flex items-start gap-2 text-[11px]">
                {costMethod === "FIFO" ? <Boxes className="mt-0.5 size-4 shrink-0 text-green-600" /> : <ShieldAlert className="mt-0.5 size-4 shrink-0 text-amber-600" />}
                <p className="text-slate-700"><strong>{costMethod === "FIFO" ? "Custo FIFO ativo" : "Usando custo médio"}</strong><span className="block text-slate-500">{costMethod === "FIFO" ? "As vendas baixam dos lotes por validade e o custo é registrado por lote." : "Ative o FIFO para controlar validade e custo por lote nas vendas."}</span></p>
              </div>
              {costMethod !== "FIFO" && <button type="button" disabled={saveProduct.isPending} onClick={() => void switchToFifo()} className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg bg-amber-500 px-3 text-[11px] font-bold text-white hover:bg-amber-600 disabled:opacity-50">{saveProduct.isPending && <LoaderCircle className="size-3.5 animate-spin" />}Ativar custo FIFO</button>}
            </div>

            <div className="mt-4 flex items-center justify-between">
              <h2 className="text-sm font-black text-slate-950">Lotes de {product.name}</h2>
              {costMethod === "FIFO" && <button type="button" onClick={() => setShowForm((value) => !value)} className="inline-flex h-9 items-center gap-2 rounded-lg bg-orange-600 px-3 text-[11px] font-bold text-white hover:bg-orange-700"><Plus className="size-3.5" />Receber lote</button>}
            </div>

            {nearExpiry.length > 0 && <p className="mt-2 rounded-xl bg-red-50 p-3 text-[11px] text-red-700"><strong>Validade próxima:</strong> {nearExpiry.map((batch) => `${batch.code} (${formatDate(batch.expiresAt!)})`).join(", ")}.</p>}

            {showForm && costMethod === "FIFO" && (
              <form onSubmit={(event) => void submitBatch(event)} className="mt-3 rounded-xl border-2 border-dashed border-amber-200 bg-amber-50/40 p-4">
                <div className="grid gap-3 sm:grid-cols-[1fr_90px_120px_1fr_auto] sm:items-end">
                  <label className="text-[11px] font-bold text-slate-700">Código do lote<input value={formState.code} onChange={(event) => setFormState((current) => ({ ...current, code: event.target.value }))} placeholder="Ex.: L2509-01" required className="mt-1 h-10 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-xs" /></label>
                  <label className="text-[11px] font-bold text-slate-700">Qtd.<input type="number" min={1} value={formState.quantity} onChange={(event) => setFormState((current) => ({ ...current, quantity: event.target.value }))} required className="mt-1 h-10 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-xs" /></label>
                  <label className="text-[11px] font-bold text-slate-700">Custo un. (R$)<input type="number" min={0} step="0.01" value={formState.unitCost} onChange={(event) => setFormState((current) => ({ ...current, unitCost: event.target.value }))} required className="mt-1 h-10 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-xs" /></label>
                  <label className="text-[11px] font-bold text-slate-700">Validade (opcional)<input type="date" value={formState.expiresAt} onChange={(event) => setFormState((current) => ({ ...current, expiresAt: event.target.value }))} className="mt-1 h-10 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-xs" /></label>
                  <button type="submit" disabled={createBatch.isPending || !formState.code.trim()} className="inline-flex h-10 items-center gap-2 rounded-lg bg-amber-500 px-4 text-[11px] font-bold text-white hover:bg-amber-600 disabled:opacity-50">{createBatch.isPending && <LoaderCircle className="size-3.5 animate-spin" />}Receber</button>
                </div>
              </form>
            )}

            {batchesLoading ? <div className="mt-3 flex items-center justify-center py-8 text-xs text-slate-400"><LoaderCircle className="mr-2 size-4 animate-spin text-orange-600" />Carregando lotes...</div> : !batches.length ? <p className="mt-3 rounded-xl bg-slate-50 p-4 text-center text-xs text-slate-400">{costMethod === "FIFO" ? "Nenhum lote cadastrado — receba o primeiro lote acima." : "Ative o custo FIFO para receber lotes."}</p> : (
              <div className="mt-3 overflow-hidden rounded-xl border border-slate-200">
                <table className="w-full text-left"><thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-400"><tr><th className="px-4 py-2.5">Lote</th><th className="px-4 py-2.5">Qtd.</th><th className="px-4 py-2.5">Custo un.</th><th className="px-4 py-2.5">Validade</th><th className="px-4 py-2.5">Recebido por</th></tr></thead><tbody className="divide-y divide-slate-100">{batches.map((batch) => <tr key={batch.id} className="text-xs"><td className="px-4 py-3 font-black text-slate-800">{batch.code}</td><td className="px-4 py-3 tabular-nums">{batch.quantity} un.</td><td className="px-4 py-3 tabular-nums text-slate-700">{formatCurrency(batch.unitCost)}</td><td className="px-4 py-3">{batch.expiresAt ? <span className={new Date(batch.expiresAt).getTime() - now < 90 * 86_400_000 ? "font-bold text-red-600" : ""}>{formatDate(batch.expiresAt)}</span> : <span className="text-slate-400">Sem validade</span>}</td><td className="px-4 py-3 text-slate-500">{batch.receivedByName}</td></tr>)}</tbody></table>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

export type { Product };
