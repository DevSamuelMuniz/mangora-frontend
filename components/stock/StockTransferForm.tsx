"use client";

import { useMemo, useState } from "react";
import { ArrowRight, ArrowRightLeft, Boxes, LoaderCircle, Store } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCreateStockTransfer, useStockOverview } from "@/features/stock/hooks/useStockOverview";
import { useUnitGroup } from "@/features/units/hooks/useUnits";

export default function StockTransferForm({ initialProductId }: { initialProductId?: string }) {
  const router = useRouter();
  const { data: stock = null, isLoading: loading, error: loadError } = useStockOverview();
  const { data: group = null } = useUnitGroup();
  const createTransfer = useCreateStockTransfer();
  const saving = createTransfer.isPending;
  const [productId, setProductId] = useState(initialProductId ?? "");
  const [destinationCompanyId, setDestinationCompanyId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  const errorMessage = error || (loadError instanceof Error ? loadError.message : "");

  const selectedProduct = useMemo(() => stock?.products.find((product) => product.id === productId), [productId, stock]);
  const availableStock = selectedProduct ? selectedProduct.stock - selectedProduct.reservedStock : 0;
  const destinations = group?.units.filter((unit) => !unit.current) ?? [];

  // Estado derivado: pré-seleciona a primeira loja de destino quando o grupo carrega.
  const [destApplied, setDestApplied] = useState(false);
  if (!destApplied && destinations[0]) {
    setDestinationCompanyId(destinations[0].company.id);
    setDestApplied(true);
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError("");
    try {
      await createTransfer.mutateAsync({ productId, destinationCompanyId, quantity, notes });
      router.push(`/estoque?toast=${encodeURIComponent("Transferência entre lojas registrada")}`);
      router.refresh();
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Não foi possível transferir o produto."); }
  }

  if (loading) return <div className="flex min-h-48 items-center justify-center"><LoaderCircle className="size-5 animate-spin text-orange-600" /><span className="ml-2 text-xs font-bold text-slate-600">Preparando transferência...</span></div>;
  if (!group?.group || destinations.length === 0) return <div className="rounded-2xl border border-amber-300 bg-amber-50 p-5 text-center"><Store className="mx-auto size-6 text-amber-700" /><h2 className="mt-3 text-sm font-black text-amber-950">Adicione outra loja primeiro</h2><p className="mt-1 text-xs text-amber-800">A transferência exige ao menos duas unidades no mesmo grupo.</p><button type="button" onClick={() => router.push("/unidades")} className="mt-4 h-10 rounded-xl bg-amber-700 px-4 text-xs font-black text-white">Gerenciar lojas</button></div>;

  return <form onSubmit={(event) => void submit(event)}>
    <div className="flex items-center gap-3"><div className="flex size-11 items-center justify-center rounded-2xl bg-orange-100 text-orange-700"><ArrowRightLeft className="size-5" /></div><div><p className="text-[10px] font-black uppercase tracking-wider text-orange-600">Movimentação entre unidades</p><h2 className="text-xl font-black text-slate-950">Transferir estoque</h2></div></div>
    {errorMessage && <div role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-800">{errorMessage}</div>}
    <div className="mt-5 grid gap-4 sm:grid-cols-2">
      <label className="text-xs font-bold text-slate-700">Produto de origem<select required value={productId} onChange={(event) => setProductId(event.target.value)} className={inputClass}><option value="">Selecione o produto</option>{stock?.products.filter((product) => product.active && product.stock - product.reservedStock > 0).map((product) => <option key={product.id} value={product.id}>{product.name} · {product.stock - product.reservedStock} disp.</option>)}</select></label>
      <label className="text-xs font-bold text-slate-700">Loja de destino<select required value={destinationCompanyId} onChange={(event) => setDestinationCompanyId(event.target.value)} className={inputClass}>{destinations.map((unit) => <option key={unit.company.id} value={unit.company.id}>{unit.company.unitCode} · {unit.company.tradeName}</option>)}</select></label>
      <label className="text-xs font-bold text-slate-700">Quantidade<input required min={1} max={availableStock || 1} type="number" value={quantity} onChange={(event) => setQuantity(Number(event.target.value))} className={inputClass} /><span className="mt-1 block text-[9px] font-medium text-slate-500">Disponível: {availableStock} unidade(s)</span></label>
      <label className="text-xs font-bold text-slate-700">Observação<input value={notes} onChange={(event) => setNotes(event.target.value)} maxLength={1000} placeholder="Ex.: reposição da filial" className={inputClass} /></label>
    </div>
    <div className="mt-5 flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 p-4"><Boxes className="size-5 text-green-700" /><div className="min-w-0 flex-1"><p className="text-xs font-black text-green-950">Saldo atualizado nas duas lojas</p><p className="mt-0.5 text-[10px] text-green-700">A saída e a entrada serão registradas juntas no histórico.</p></div><ArrowRight className="size-4 text-green-700" /></div>
    <button type="submit" disabled={saving || !productId || !destinationCompanyId || quantity < 1} className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-orange-600 text-xs font-black text-white shadow-lg shadow-orange-200 hover:bg-orange-700 disabled:opacity-50">{saving && <LoaderCircle className="size-4 animate-spin" />}Confirmar transferência</button>
  </form>;
}

const inputClass = "mt-2 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-950 outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100";
