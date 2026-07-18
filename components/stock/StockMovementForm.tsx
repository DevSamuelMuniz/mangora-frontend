"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, type ReactNode, useEffect, useMemo, useState } from "react";
import {
  ArrowDownToLine,
  ArrowLeft,
  ArrowRightLeft,
  ArrowUpFromLine,
  ClipboardCheck,
  LoaderCircle,
  Save,
  type LucideIcon,
} from "lucide-react";

import { apiRequest } from "@/lib/api/client";
import type {
  StockMovement,
  StockMovementInput,
  StockMovementType,
  StockOverviewResponse,
} from "@/types/stock";

const movementOptions: {
  type: StockMovementType;
  label: string;
  description: string;
  icon: LucideIcon;
}[] = [
  { type: "ENTRY", label: "Entrada", description: "Compra, devolução ou reposição", icon: ArrowDownToLine },
  { type: "EXIT", label: "Saída", description: "Perda, consumo ou retirada", icon: ArrowUpFromLine },
  { type: "ADJUSTMENT", label: "Ajuste", description: "Correção após contagem física", icon: ClipboardCheck },
];

const reasons: Record<StockMovementType, string[]> = {
  ENTRY: ["Compra de fornecedor", "Devolução de cliente", "Reposição", "Outro"],
  EXIT: ["Perda ou avaria", "Consumo interno", "Retirada", "Outro"],
  ADJUSTMENT: ["Contagem física", "Correção de cadastro", "Avaria identificada", "Outro"],
};

export default function StockMovementForm({ initialProductId = "" }: { initialProductId?: string }) {
  const router = useRouter();
  const [products, setProducts] = useState<StockOverviewResponse["products"]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productId, setProductId] = useState(initialProductId);
  const [movementType, setMovementType] = useState<StockMovementType>("ENTRY");
  const [quantity, setQuantity] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    apiRequest<StockOverviewResponse>("/stock")
      .then((data) => {
        if (mounted) setProducts(data.products);
      })
      .catch((requestError: unknown) => {
        if (mounted) setError(requestError instanceof Error ? requestError.message : "Não foi possível carregar os produtos.");
      })
      .finally(() => {
        if (mounted) setLoadingProducts(false);
      });
    return () => { mounted = false; };
  }, []);

  const selectedProduct = useMemo(
    () => products.find((product) => product.id === productId),
    [productId, products],
  );
  const numericQuantity = Number(quantity);
  const projectedStock = selectedProduct
    ? movementType === "ENTRY"
      ? selectedProduct.stock + (Number.isFinite(numericQuantity) ? numericQuantity : 0)
      : movementType === "EXIT"
        ? selectedProduct.stock - (Number.isFinite(numericQuantity) ? numericQuantity : 0)
        : Number.isFinite(numericQuantity)
          ? numericQuantity
          : selectedProduct.stock
    : 0;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!selectedProduct) {
      setError("Selecione um produto.");
      return;
    }
    if (!Number.isInteger(numericQuantity) || numericQuantity < (movementType === "ADJUSTMENT" ? 0 : 1)) {
      setError(movementType === "ADJUSTMENT" ? "Informe um saldo contado válido." : "Informe uma quantidade inteira maior que zero.");
      return;
    }
    if (movementType === "EXIT" && numericQuantity > selectedProduct.stock) {
      setError(`A saída não pode ultrapassar o saldo atual de ${selectedProduct.stock} unidade(s).`);
      return;
    }

    const formData = new FormData(event.currentTarget);
    const unitCostValue = String(formData.get("unitCost") ?? "").trim();
    const reason = String(formData.get("reason") ?? "").trim();
    const notes = String(formData.get("notes") ?? "").trim();
    const payload: StockMovementInput = {
      productId,
      type: movementType,
      quantity: numericQuantity,
      reason,
      ...(unitCostValue && { unitCost: Number(unitCostValue) }),
      ...(notes && { notes }),
    };

    try {
      setLoading(true);
      await apiRequest<StockMovement>("/stock/movements", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      router.push("/estoque");
      router.refresh();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Não foi possível registrar a movimentação.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-5xl">
      <div className="flex items-start gap-3"><Link href="/estoque" aria-label="Voltar para estoque" className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-50 hover:text-violet-600"><ArrowLeft className="size-4" /></Link><div><p className="text-[11px] font-bold uppercase tracking-[0.14em] text-violet-600">Operação</p><h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">Nova movimentação</h1><p className="mt-1 text-xs text-slate-500">Registre uma entrada, saída ou ajuste de saldo.</p></div></div>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <SectionTitle icon={ArrowRightLeft} title="Tipo de movimentação" description="Escolha como o saldo deve ser atualizado." />
          <fieldset className="mt-4 grid gap-3 md:grid-cols-3"><legend className="sr-only">Tipo de movimentação</legend>{movementOptions.map((option) => { const Icon = option.icon; const selected = movementType === option.type; return <label key={option.type} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition ${selected ? "border-violet-300 bg-violet-50" : "border-slate-200 hover:bg-slate-50"}`}><input type="radio" name="movementType" value={option.type} checked={selected} onChange={() => { setMovementType(option.type); setError(""); }} className="sr-only" /><div className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${selected ? "bg-violet-600 text-white" : "bg-slate-100 text-slate-500"}`}><Icon className="size-4" /></div><div><p className={`text-xs font-bold ${selected ? "text-violet-700" : "text-slate-800"}`}>{option.label}</p><p className="mt-0.5 text-[9px] text-slate-400">{option.description}</p></div></label>; })}</fieldset>
        </div>

        <div className="grid items-start gap-4 lg:grid-cols-[1fr_0.7fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <SectionTitle icon={Save} title="Dados da movimentação" description="Informe produto, quantidade e motivo." />
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Produto" id="productId" className="sm:col-span-2"><select id="productId" name="productId" required disabled={loadingProducts} value={productId} onChange={(event) => { setProductId(event.target.value); setError(""); }} className={inputClassName}><option value="">{loadingProducts ? "Carregando produtos..." : "Selecione um produto"}</option>{products.map((product) => <option key={product.id} value={product.id}>{product.name} · {product.sku} · {product.stock - product.reservedStock} disp. ({product.reservedStock} reserv.)</option>)}</select></Field>
              <Field label={movementType === "ADJUSTMENT" ? "Novo saldo contado" : "Quantidade"} id="quantity"><input id="quantity" name="quantity" type="number" required min={movementType === "ADJUSTMENT" ? 0 : 1} step="1" value={quantity} onChange={(event) => setQuantity(event.target.value)} placeholder="0" className={inputClassName} /></Field>
              <Field label="Custo unitário (opcional)" id="unitCost"><div className="relative"><span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">R$</span><input id="unitCost" name="unitCost" type="number" min="0" step="0.01" placeholder="0,00" className={`${inputClassName} pl-10`} /></div></Field>
              <Field label="Motivo" id="reason" className="sm:col-span-2"><select key={movementType} id="reason" name="reason" required defaultValue="" className={inputClassName}><option value="" disabled>Selecione um motivo</option>{reasons[movementType].map((reason) => <option key={reason} value={reason}>{reason}</option>)}</select></Field>
              <Field label="Observações (opcional)" id="notes" className="sm:col-span-2"><textarea id="notes" name="notes" rows={3} maxLength={1000} placeholder="Detalhes adicionais..." className="w-full resize-y rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100" /></Field>
            </div>
          </div>

          <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:sticky lg:top-20"><h2 className="text-sm font-bold text-slate-950">Projeção do saldo</h2><p className="mt-0.5 text-[10px] text-slate-400">Confira o impacto antes de registrar.</p>{selectedProduct ? <div className="mt-4"><div className="rounded-xl bg-slate-50 p-3"><p className="truncate text-xs font-bold text-slate-800">{selectedProduct.name}</p><p className="mt-1 text-[10px] text-slate-400">{selectedProduct.sku}</p></div><div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-center"><Balance label="Saldo atual" value={selectedProduct.stock} /><ArrowRightLeft className="size-4 text-slate-300" /><Balance label="Saldo projetado" value={Math.max(0, projectedStock)} highlight /></div>{projectedStock < 0 && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-[10px] font-semibold text-red-600">Saldo projetado inválido. Reduza a quantidade.</p>}</div> : <div className="mt-4 flex min-h-36 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 p-5 text-center">{loadingProducts ? <LoaderCircle className="size-5 animate-spin text-violet-600" /> : <ArrowRightLeft className="size-5 text-slate-300" />}<p className="mt-2 text-xs font-semibold text-slate-500">{loadingProducts ? "Carregando saldos..." : "Selecione um produto para visualizar a projeção."}</p></div>}</aside>
        </div>

        {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">{error}</div>}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><Link href="/estoque" className="flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-600 hover:bg-slate-50">Cancelar</Link><button type="submit" disabled={loading || loadingProducts} className="flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 text-sm font-bold text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0">{loading ? <><LoaderCircle className="size-4 animate-spin" />Registrando...</> : <><Save className="size-4" />Registrar movimentação</>}</button></div>
      </form>
    </section>
  );
}

const inputClassName = "h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100 disabled:cursor-not-allowed disabled:bg-slate-50";
function SectionTitle({ icon: Icon, title, description }: { icon: LucideIcon; title: string; description: string }) { return <div className="flex items-center gap-3 border-b border-slate-100 pb-4"><div className="flex size-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600"><Icon className="size-4" /></div><div><h2 className="text-sm font-bold text-slate-950">{title}</h2><p className="mt-0.5 text-[10px] text-slate-400">{description}</p></div></div>; }
function Field({ label, id, children, className = "" }: { label: string; id: string; children: ReactNode; className?: string }) { return <div className={className}><label htmlFor={id} className="mb-1.5 block text-xs font-bold text-slate-700">{label}</label>{children}</div>; }
function Balance({ label, value, highlight = false }: { label: string; value: number; highlight?: boolean }) { return <div className={`rounded-xl p-3 ${highlight ? "bg-violet-50" : "bg-slate-50"}`}><p className="text-[9px] text-slate-400">{label}</p><p className={`mt-1 text-xl font-black ${highlight ? "text-violet-700" : "text-slate-800"}`}>{value}</p><p className="text-[9px] text-slate-400">unidades</p></div>; }
