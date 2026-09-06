"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, ClipboardCheck, LoaderCircle, PackageCheck, Plus, Search, X } from "lucide-react";

import { useProducts } from "@/features/products/hooks/useProducts";
import { useAddCountItems, useCancelStockCount, useCompleteStockCount, useCreateStockCount, useStockCounts } from "@/features/stock/hooks/useInventoryBatches";
import { formatDate } from "@/lib/format";
import { stockCountStatusLabels, type StockCount } from "@/types/stock";

const statusStyle: Record<StockCount["status"], string> = {
  DRAFT: "bg-amber-50 text-amber-700 border-amber-200",
  COMPLETED: "bg-green-50 text-green-700 border-green-200",
  CANCELLED: "bg-red-50 text-red-600 border-red-200",
};

export default function InventoryWorkspace() {
  const { data: counts = [], isLoading, error, refetch } = useStockCounts();
  const [notice, setNotice] = useState("");
  const [actionError, setActionError] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [editing, setEditing] = useState<StockCount | null>(null);

  return (
    <section className="mx-auto max-w-5xl">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-orange-600">Estoque · Precisão</p>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">Inventário físico</h1>
          <p className="mt-1 text-xs text-slate-500">Conte o que existe na prateleira e ajuste o sistema com justificativa.</p>
        </div>
        <button type="button" onClick={() => setShowNew(true)} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 px-4 text-sm font-bold text-white shadow-lg shadow-orange-200 transition hover:-translate-y-0.5 hover:shadow-xl"><Plus className="size-4" />Nova contagem</button>
      </div>

      {notice && <div role="status" className="mt-4 flex items-center justify-between rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-xs font-semibold text-green-700"><span>{notice}</span><button type="button" onClick={() => setNotice("")} className="font-bold underline">Fechar</button></div>}
      {actionError && <div role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">{actionError}</div>}

      {isLoading ? <div className="mt-5 flex min-h-40 items-center justify-center text-xs font-semibold text-slate-500"><LoaderCircle className="mr-2 size-5 animate-spin text-orange-600" />Carregando contagens...</div> : error ? <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-xs text-red-700">{error instanceof Error ? error.message : "Não foi possível carregar."}<button type="button" onClick={() => void refetch()} className="ml-2 font-bold underline">Tentar novamente</button></div> : !counts.length ? <Empty /> : (
        <div className="mt-5 space-y-3">
          {counts.map((count) => (
            <article key={count.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <button type="button" onClick={() => count.status === "DRAFT" ? setEditing(count) : setEditing(editing?.id === count.id ? null : count)} className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-slate-50 sm:px-5">
                <div className="flex items-center gap-3">
                  <span className="flex size-9 items-center justify-center rounded-xl bg-orange-50 text-orange-600"><ClipboardCheck className="size-4" /></span>
                  <div><p className="text-xs font-black text-slate-800">{count.name ?? `Contagem INV-${count.id.slice(0, 6).toUpperCase()}`}</p><p className="mt-0.5 text-[10px] text-slate-400">{formatDate(count.createdAt)} · {count.createdByName} · {count.items.length} item(ns)</p></div>
                </div>
                <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${statusStyle[count.status]}`}>{stockCountStatusLabels[count.status]}</span>
              </button>
              {editing?.id === count.id && <div className="border-t border-slate-100 px-4 py-4 sm:px-5">{count.status === "DRAFT" ? <CountEditor count={count} onDone={(message) => setNotice(message)} onError={(message) => setActionError(message)} /> : <CountSummary count={count} />}</div>}
            </article>
          ))}
        </div>
      )}

      {showNew && <NewCountDialog onClose={() => setShowNew(false)} onDone={(message) => setNotice(message)} onError={(message) => setActionError(message)} />}
    </section>
  );
}

function CountEditor({ count, onDone, onError }: { count: StockCount; onDone: (message: string) => void; onError: (message: string) => void }) {
  const { data: products } = useProducts();
  const addItems = useAddCountItems();
  const complete = useCompleteStockCount();
  const cancel = useCancelStockCount();
  const [quantities, setQuantities] = useState<Record<string, string>>({});
  const [search, setSearch] = useState("");
  const trackStock = useMemo(() => (products ?? []).filter((product) => product.trackStock && product.active), [products]);
  const visible = useMemo(() => {
    const q = search.trim().toLocaleLowerCase("pt-BR");
    return q ? trackStock.filter((product) => product.name.toLocaleLowerCase("pt-BR").includes(q)) : trackStock;
  }, [trackStock, search]);
  const counted = visible.filter((product) => quantities[product.id] !== undefined && quantities[product.id] !== "");

  async function saveAndComplete() {
    const items = counted.map((product) => ({ productId: product.id, countedStock: Math.max(0, Math.trunc(Number(quantities[product.id]))) }));
    if (!items.length) { onError("Informe a contagem de pelo menos um produto."); return; }
    try {
      await addItems.mutateAsync({ id: count.id, items });
      await complete.mutateAsync(count.id);
      onDone("Contagem concluída — divergências ajustaram o estoque com movimento justificado.");
    } catch (requestError) {
      onError(requestError instanceof Error ? requestError.message : "Não foi possível concluir a contagem.");
    }
  }

  return (
    <div>
      <p className="text-xs font-bold text-slate-700">Conte cada produto e registre o valor encontrado. A diferença vira um ajuste de estoque com justificativa.</p>
      <label className="relative mt-3 block"><span className="sr-only">Buscar produto</span><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar produto para contar..." className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none focus:border-orange-300 focus:bg-white" /></label>
      <div className="mt-3 max-h-80 divide-y divide-slate-100 overflow-y-auto rounded-xl border border-slate-200">
        {visible.map((product) => <div key={product.id} className="flex items-center gap-3 p-3"><div className="min-w-0 flex-1"><p className="truncate text-xs font-bold text-slate-800">{product.name}</p><p className="mt-0.5 text-[10px] text-slate-400">SKU {product.sku} · sistema: {product.stock} un.</p></div><label className="flex items-center gap-2 text-[11px] font-bold text-slate-700">Contado<input type="number" min={0} value={quantities[product.id] ?? ""} onChange={(event) => setQuantities((current) => ({ ...current, [product.id]: event.target.value }))} className="h-9 w-20 rounded-lg border border-slate-200 px-2 text-xs" /></label></div>)}
        {!visible.length && <p className="p-4 text-center text-xs text-slate-400">{trackStock.length ? "Nenhum produto encontrado." : "Nenhum produto com controle de estoque."}</p>}
      </div>
      <div className="mt-4 flex flex-wrap justify-end gap-2">
        {count.items.length === 0 && <button type="button" onClick={() => void cancel.mutateAsync(count.id).then(() => onDone("Contagem cancelada.")).catch((requestError: unknown) => onError(requestError instanceof Error ? requestError.message : "Erro"))} className="h-10 rounded-xl border border-red-200 px-4 text-xs font-bold text-red-600 hover:bg-red-50">Cancelar contagem</button>}
        <button type="button" disabled={addItems.isPending || complete.isPending || !counted.length} onClick={() => void saveAndComplete()} className="inline-flex h-10 items-center gap-2 rounded-xl bg-green-600 px-4 text-xs font-bold text-white hover:bg-green-700 disabled:opacity-50">{(addItems.isPending || complete.isPending) && <LoaderCircle className="size-3.5 animate-spin" />}<CheckCircle2 className="size-3.5" />Concluir contagem ({counted.length})</button>
      </div>
    </div>
  );
}

function CountSummary({ count }: { count: StockCount }) {
  const differences = count.items.filter((item) => item.difference !== 0);
  return <div><p className="text-xs text-slate-600">{count.completedByName ? `Concluída por ${count.completedByName}` : "Concluída"}{count.completedAt ? ` em ${formatDate(count.completedAt)}` : ""}.</p><div className="mt-3 max-h-64 divide-y divide-slate-100 overflow-y-auto rounded-xl border border-slate-200">{count.items.map((item) => <div key={item.id} className="flex items-center justify-between gap-3 p-3"><div className="min-w-0"><p className="truncate text-xs font-bold text-slate-800">{item.product.name}</p><p className="mt-0.5 text-[10px] text-slate-400">sistema {item.expectedStock} · contado {item.countedStock}</p></div><span className={`text-xs font-black ${item.difference === 0 ? "text-green-600" : item.difference < 0 ? "text-red-600" : "text-amber-600"}`}>{item.difference === 0 ? "OK" : `${item.difference > 0 ? "+" : ""}${item.difference} un.`}</span></div>)}</div>{differences.length > 0 && <p className="mt-2 rounded-xl bg-slate-50 p-3 text-[11px] text-slate-500">{differences.length} item(ns) com diferença — ajustados com movimento justificado no histórico de estoque.</p>}</div>;
}

function NewCountDialog({ onClose, onDone, onError }: { onClose: () => void; onDone: (message: string) => void; onError: (message: string) => void }) {
  const create = useCreateStockCount();
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    try {
      const count = await create.mutateAsync({ name: name.trim() || undefined, notes: notes.trim() || undefined });
      onClose();
      onDone(`Contagem criada em rascunho (INV-${count.id.slice(0, 6).toUpperCase()}). Abra-a para contar os produtos.`);
    } catch (requestError) {
      onError(requestError instanceof Error ? requestError.message : "Não foi possível criar a contagem.");
    }
  }
  return <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm"><div role="dialog" aria-modal="true" className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl"><div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-wider text-orange-600">Inventário físico</p><h2 className="mt-1 text-lg font-black text-slate-950">Nova contagem</h2></div><button type="button" onClick={onClose} aria-label="Fechar" className="flex size-9 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100"><X className="size-4" /></button></div><form onSubmit={(event) => void submit(event)} className="mt-4 space-y-3"><label className="block text-xs font-bold text-slate-700">Nome (opcional)<input value={name} onChange={(event) => setName(event.target.value)} placeholder="Ex.: Contagem mensal de setembro" className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm" /></label><label className="block text-xs font-bold text-slate-700">Observações (opcional)<textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={2} placeholder="Ex.: inclui depósito interno" className="mt-1.5 w-full resize-none rounded-xl border border-slate-200 p-3 text-xs" /></label><div className="flex justify-end gap-2 pt-2"><button type="button" onClick={onClose} className="h-10 rounded-xl border border-slate-200 px-4 text-xs font-bold text-slate-600 hover:bg-slate-50">Cancelar</button><button type="submit" disabled={create.isPending} className="inline-flex h-10 items-center gap-2 rounded-xl bg-orange-600 px-4 text-xs font-bold text-white disabled:opacity-50">{create.isPending && <LoaderCircle className="size-3.5 animate-spin" />}Criar contagem</button></div></form></div></div>;
}

function Empty() {
  return <div className="mt-5 flex min-h-64 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white p-8 text-center"><PackageCheck className="size-8 text-slate-300" /><h2 className="mt-3 text-sm font-black text-slate-900">Nenhuma contagem ainda</h2><p className="mt-1 max-w-sm text-xs text-slate-500">Crie uma contagem para conferir o estoque físico e ajustar diferenças com justificativa.</p></div>;
}
