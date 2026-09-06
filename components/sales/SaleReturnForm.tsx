"use client";

import { useState } from "react";
import { CornerDownLeft, LoaderCircle, X } from "lucide-react";

import { useReturnSaleItems } from "@/features/sales/hooks/useSales";
import type { Sale } from "@/types/sale";

export default function SaleReturnForm({ sale, onClose, onDone }: { sale: Sale; onClose: () => void; onDone: (message: string) => void }) {
  const returnItems = useReturnSaleItems();
  const [reason, setReason] = useState("");
  const [quantities, setQuantities] = useState<Record<string, string>>({});
  const [error, setError] = useState("");

  const selected = sale.items
    .map((item) => ({ item, quantity: Number(quantities[item.id] || 0) }))
    .filter(({ quantity }) => quantity > 0);

  async function submit() {
    if (!reason.trim() || reason.trim().length < 3) {
      setError("Informe o motivo da devolução (mínimo 3 caracteres).");
      return;
    }
    if (!selected.length) {
      setError("Selecione a quantidade de pelo menos um item.");
      return;
    }
    try {
      setError("");
      await returnItems.mutateAsync({
        id: sale.id,
        reason: reason.trim(),
        items: selected.map(({ item, quantity }) => ({ saleItemId: item.id, quantity })),
      });
      onDone(`${selected.reduce((sum, entry) => sum + entry.quantity, 0)} item(ns) devolvido(s) ao estoque.`);
      onClose();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Não foi possível registrar a devolução.");
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
      <div role="dialog" aria-modal="true" className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div><p className="text-[10px] font-bold uppercase tracking-wider text-orange-600">Devolução parcial</p><h2 className="mt-1 text-lg font-black text-slate-950">Devolver itens da {sale.code}</h2><p className="mt-1 text-xs text-slate-500">Os itens devolvidos voltam ao estoque com a justificativa registrada.</p></div>
          <button type="button" onClick={onClose} aria-label="Fechar" className="flex size-9 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100"><X className="size-4" /></button>
        </div>

        <div className="mt-4 divide-y divide-slate-100 rounded-xl border border-slate-200">
          {sale.items.map((item) => {
            const remaining = item.quantity - item.returnedQuantity;
            return (
              <div key={item.id} className="flex items-center gap-3 p-3">
                <div className="min-w-0 flex-1"><p className="truncate text-xs font-bold text-slate-800">{item.productName}</p><p className="mt-0.5 text-[10px] text-slate-400">Vendido {item.quantity} · já devolvido {item.returnedQuantity} · resta {remaining}</p></div>
                {remaining > 0 ? <label className="flex items-center gap-2 text-[11px] font-bold text-slate-700">Qtd.<input type="number" min={0} max={remaining} value={quantities[item.id] ?? ""} onChange={(event) => setQuantities((current) => ({ ...current, [item.id]: event.target.value }))} className="h-9 w-16 rounded-lg border border-slate-200 px-2 text-xs" /></label> : <span className="text-[10px] font-bold text-green-600">Devolvido</span>}
              </div>
            );
          })}
        </div>

        <label htmlFor="returnReason" className="mt-4 block text-xs font-bold text-slate-700">Motivo da devolução</label>
        <textarea id="returnReason" value={reason} onChange={(event) => setReason(event.target.value)} maxLength={500} rows={2} placeholder="Ex.: produto avariado, cliente desistiu..." className="mt-1.5 w-full resize-none rounded-xl border border-slate-200 p-3 text-xs outline-none focus:border-orange-300 focus:ring-4 focus:ring-orange-100" />

        {selected.length > 0 && <p className="mt-2 rounded-xl bg-slate-50 p-3 text-xs text-slate-600">{selected.reduce((sum, entry) => sum + entry.quantity, 0)} item(ns) selecionado(s) para devolução.</p>}
        {error && <p className="mt-2 rounded-xl bg-red-50 p-3 text-xs text-red-700">{error}</p>}

        <div className="mt-5 flex justify-end gap-2">
          <button type="button" disabled={returnItems.isPending} onClick={onClose} className="h-10 rounded-xl border border-slate-200 px-4 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50">Cancelar</button>
          <button type="button" disabled={returnItems.isPending} onClick={() => void submit()} className="inline-flex h-10 items-center gap-2 rounded-xl bg-orange-600 px-4 text-xs font-bold text-white hover:bg-orange-700 disabled:opacity-50">{returnItems.isPending ? <LoaderCircle className="size-3.5 animate-spin" /> : <CornerDownLeft className="size-3.5" />}Devolver itens</button>
        </div>
      </div>
    </div>
  );
}
