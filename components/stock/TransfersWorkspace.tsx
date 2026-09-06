"use client";

import { useState } from "react";
import { ArrowRight, Check, CornerUpLeft, LoaderCircle, Package, Truck } from "lucide-react";

import {
  useCancelStockTransfer,
  useConfirmStockTransfer,
  useReceiveStockTransfer,
  useStockTransfers,
} from "@/features/stock/hooks/useStockOverview";
import { formatDate } from "@/lib/format";
import type { StockTransfer } from "@/types/stock";

const statusStamp: Record<StockTransfer["status"], { className: string; label: string }> = {
  SENT: { className: "border-amber-300 bg-amber-50 text-amber-700", label: "ENVIADA" },
  RECEIVED: { className: "border-blue-300 bg-blue-50 text-blue-700", label: "RECEBIDA" },
  CONFIRMED: { className: "border-green-300 bg-green-50 text-green-700", label: "CONFIRMADA" },
  CANCELLED: { className: "border-red-300 bg-red-50 text-red-600", label: "CANCELADA" },
};

export default function TransfersWorkspace() {
  const { data: transfers = [], isLoading, error, refetch } = useStockTransfers();
  const receive = useReceiveStockTransfer();
  const confirm = useConfirmStockTransfer();
  const cancel = useCancelStockTransfer();
  const [notice, setNotice] = useState("");
  const [actionError, setActionError] = useState("");
  const [receiving, setReceiving] = useState<{ id: string; quantity: string } | null>(null);

  async function handleReceive(transfer: StockTransfer) {
    if (!receiving || receiving.id !== transfer.id) return;
    const quantity = Number(receiving.quantity);
    if (!Number.isFinite(quantity) || quantity < 0 || quantity > transfer.quantity) {
      setActionError(`A quantidade recebida deve ficar entre 0 e ${transfer.quantity}.`);
      return;
    }
    try {
      setActionError("");
      await receive.mutateAsync({ id: transfer.id, receivedQuantity: quantity });
      setReceiving(null);
      setNotice("Transferência recebida. Confirme quando a conferência terminar.");
    } catch (requestError) {
      setActionError(requestError instanceof Error ? requestError.message : "Não foi possível receber a transferência.");
    }
  }

  async function handleConfirm(id: string) {
    try {
      setActionError("");
      await confirm.mutateAsync(id);
      setNotice("Transferência confirmada.");
    } catch (requestError) {
      setActionError(requestError instanceof Error ? requestError.message : "Não foi possível confirmar a transferência.");
    }
  }

  async function handleCancel(id: string) {
    try {
      setActionError("");
      await cancel.mutateAsync(id);
      setNotice("Transferência cancelada e estoque da origem estornado.");
    } catch (requestError) {
      setActionError(requestError instanceof Error ? requestError.message : "Não foi possível cancelar a transferência.");
    }
  }

  return (
    <section className="mx-auto max-w-5xl">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-orange-600">Estoque · Entre lojas</p>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">Transferências</h1>
          <p className="mt-1 text-xs text-slate-500">Envie, receba e confirme remessas entre unidades do grupo.</p>
        </div>
      </div>

      {notice && <div role="status" className="mt-4 flex items-center justify-between rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-xs font-semibold text-green-700"><span>{notice}</span><button type="button" onClick={() => setNotice("")} className="font-bold underline">Fechar</button></div>}
      {actionError && <div role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">{actionError}</div>}

      {isLoading ? <div className="mt-5 flex min-h-40 items-center justify-center text-xs font-semibold text-slate-500"><LoaderCircle className="mr-2 size-5 animate-spin text-orange-600" />Carregando transferências...</div> : error ? <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-xs text-red-700">{error instanceof Error ? error.message : "Não foi possível carregar."}<button type="button" onClick={() => void refetch()} className="ml-2 font-bold underline">Tentar novamente</button></div> : !transfers.length ? <div className="mt-5 flex min-h-64 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white p-8 text-center"><Truck className="size-8 text-slate-300" /><h2 className="mt-3 text-sm font-black text-slate-900">Nenhuma transferência</h2><p className="mt-1 max-w-sm text-xs text-slate-500">Envie produtos para outra unidade do grupo em Estoque → Transferir entre lojas.</p></div> : (
        <div className="mt-5 space-y-4">
          {transfers.map((transfer) => <TransferWaybill key={transfer.id} transfer={transfer} receiving={receiving} onStartReceiving={(value) => setReceiving(value)} onReceive={() => void handleReceive(transfer)} onConfirm={() => void handleConfirm(transfer.id)} onCancel={() => void handleCancel(transfer.id)} busy={receive.isPending || confirm.isPending || cancel.isPending} />)}
        </div>
      )}
    </section>
  );
}

function TransferWaybill({ transfer, receiving, onStartReceiving, onReceive, onConfirm, onCancel, busy }: {
  transfer: StockTransfer;
  receiving: { id: string; quantity: string } | null;
  onStartReceiving: (value: { id: string; quantity: string } | null) => void;
  onReceive: () => void;
  onConfirm: () => void;
  onCancel: () => void;
  busy: boolean;
}) {
  const stamp = statusStamp[transfer.status];
  const isSource = transfer.side === "SOURCE";
  const product = isSource ? transfer.sourceProduct : transfer.destinationProduct;
  const canReceive = transfer.status === "SENT" && !isSource;
  const canConfirm = transfer.status === "RECEIVED" && !isSource;
  const canCancel = transfer.status === "SENT" && isSource;

  return (
    <article className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-start justify-between gap-3 border-b-2 border-dashed border-slate-100 px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-orange-50 text-orange-600"><Package className="size-4" /></span>
          <div><p className="text-xs font-black text-slate-800">TRF-{transfer.id.slice(0, 8).toUpperCase()}</p><p className="mt-0.5 text-[10px] text-slate-400">{formatDate(transfer.createdAt)} · {transfer.createdByName}</p></div>
        </div>
        <span className={`rotate-[-6deg] rounded-md border px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.18em] ${stamp.className}`}>{stamp.label}</span>
      </div>

      <div className="px-4 py-4 sm:px-5">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1 rounded-xl bg-slate-50 p-3"><p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Origem</p><p className="mt-1 truncate text-xs font-bold text-slate-800">{transfer.sourceCompany.tradeName}</p></div>
          <ArrowRight className="size-4 shrink-0 text-slate-300" />
          <div className="min-w-0 flex-1 rounded-xl bg-slate-50 p-3"><p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Destino</p><p className="mt-1 truncate text-xs font-bold text-slate-800">{transfer.destinationCompany.tradeName}</p></div>
        </div>

        <div className="mt-3 flex items-center justify-between gap-4 rounded-xl border border-slate-100 p-3">
          <div className="min-w-0"><p className="truncate text-xs font-bold text-slate-800">{product.name}</p><p className="mt-0.5 text-[10px] text-slate-400">{product.sku}</p></div>
          <p className="text-sm font-black tabular-nums text-slate-900">{transfer.quantity} un.</p>
        </div>

        {transfer.receivedQuantity != null && (
          <p className={`mt-2 text-[11px] font-semibold ${transfer.discrepancy === 0 ? "text-green-700" : "text-red-600"}`}>
            Recebido {transfer.receivedQuantity} de {transfer.quantity} {transfer.discrepancy === 0 ? "· sem divergência" : `· divergência de ${transfer.discrepancy} un.`}
          </p>
        )}

        {canReceive && (
          <div className="mt-3 flex flex-col gap-2 rounded-xl bg-blue-50/60 p-3 sm:flex-row sm:items-center">
            <label className="flex-1 text-[11px] font-bold text-slate-700">Quantidade recebida<input type="number" min={0} max={transfer.quantity} value={receiving?.id === transfer.id ? receiving.quantity : String(transfer.quantity)} onChange={(event) => onStartReceiving({ id: transfer.id, quantity: event.target.value })} className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-xs" /></label>
            <button type="button" disabled={busy} onClick={onReceive} className="h-9 rounded-lg bg-blue-600 px-3 text-[11px] font-bold text-white hover:bg-blue-700 disabled:opacity-50">{busy ? <LoaderCircle className="size-3.5 animate-spin" /> : "Receber"}</button>
          </div>
        )}

        <div className="mt-3 flex flex-wrap gap-2">
          {canConfirm && <button type="button" disabled={busy} onClick={onConfirm} className="inline-flex h-9 items-center gap-2 rounded-lg bg-green-600 px-3 text-[11px] font-bold text-white hover:bg-green-700 disabled:opacity-50"><Check className="size-3.5" />Confirmar recebimento</button>}
          {canCancel && <button type="button" disabled={busy} onClick={onCancel} className="inline-flex h-9 items-center gap-2 rounded-lg border border-red-200 bg-white px-3 text-[11px] font-bold text-red-600 hover:bg-red-50 disabled:opacity-50"><CornerUpLeft className="size-3.5" />Cancelar envio</button>}
          {transfer.status === "SENT" && isSource && <p className="text-[10px] text-slate-400">Aguardando a unidade de destino receber.</p>}
          {transfer.status === "RECEIVED" && !isSource && <p className="text-[10px] text-slate-400">Recebida — confirme para fechar a remessa.</p>}
          {transfer.status === "CONFIRMED" && <p className="text-[10px] text-green-700">Fechada{transfer.confirmedByName ? ` por ${transfer.confirmedByName}` : ""}.</p>}
        </div>
      </div>
    </article>
  );
}
