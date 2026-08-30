"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Ban, CheckCircle2, ChevronDown, ExternalLink, FileCheck2, FileClock, FileText, LoaderCircle, Plus, ReceiptText, RefreshCw, Send, Settings } from "lucide-react";
import type { FiscalDocument, FiscalDocumentStatus, FiscalDocumentType } from "@/types/fiscal";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { useFiscalAction, useFiscalOverview, usePrepareDocument } from "@/features/fiscal/hooks/useFiscal";


export default function FiscalCenter() {
  const { data: overview, isLoading: loading, error: loadError } = useFiscalOverview();
  const prepareMutation = usePrepareDocument();
  const actionMutation = useFiscalAction();
  const saving = prepareMutation.isPending;
  const actingId = actionMutation.isPending ? (actionMutation.variables?.id ?? null) : null;
  const documents = useMemo(() => overview?.documents ?? [], [overview]);
  const sales = useMemo(() => overview?.sales ?? [], [overview]);
  const readiness = useMemo(() => overview?.readiness ?? null, [overview]);
  const [saleId, setSaleId] = useState("");
  const [type, setType] = useState<FiscalDocumentType>("NFCE");
  const [actionError, setActionError] = useState("");
  const [message, setMessage] = useState("");

  const errorMessage = actionError || (loadError instanceof Error ? loadError.message : "");

  const eligibleSales = useMemo(() => sales.filter((sale) => sale.status === "COMPLETED" && !documents.some((document) => document.saleId === sale.id && document.type === type)), [documents, sales, type]);

  async function prepare() {
    setActionError(""); setMessage("");
    try {
      await prepareMutation.mutateAsync({ saleId, type });
      setMessage(`${type === "NFE" ? "NF-e" : "NFC-e"} preparada. Ela ainda não foi transmitida à SEFAZ.`);
      const next = eligibleSales.find((sale) => sale.id !== saleId); setSaleId(next?.id ?? "");
    } catch (cause) { setActionError(cause instanceof Error ? cause.message : "Não foi possível preparar o documento."); }
  }

  async function fiscalAction(document: FiscalDocument, action: "issue" | "consult" | "cancel") {
    let reason: string | undefined;
    if (action === "cancel") {
      const value = window.prompt("Informe a justificativa do cancelamento (15 a 255 caracteres):")?.trim();
      if (!value) return;
      reason = value;
    }
    setActionError(""); setMessage("");
    try {
      await actionMutation.mutateAsync({ id: document.id, action, reason });
      setMessage(action === "issue" ? "Documento enviado à Focus NFe." : action === "consult" ? "Situação atualizada no provedor fiscal." : "Documento cancelado na SEFAZ.");
    } catch (cause) { setActionError(cause instanceof Error ? cause.message : "Não foi possível concluir a ação fiscal."); }
  }

  const authorized = documents.filter((document) => document.status === "AUTHORIZED").length;
  const pending = documents.filter((document) => ["DRAFT","READY","PROCESSING"].includes(document.status)).length;
  if (loading) return <div className="flex min-h-72 items-center justify-center"><LoaderCircle className="size-5 animate-spin text-orange-600" /><span className="ml-2 text-xs font-bold text-slate-600">Carregando documentos fiscais...</span></div>;

  return <section className="space-y-5"><div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"><div><p className="text-[11px] font-black uppercase tracking-[0.14em] text-orange-600">NF-e e NFC-e</p><h1 className="mt-1 text-2xl font-black text-slate-950 sm:text-3xl">Central de notas fiscais</h1><p className="mt-1 text-xs text-slate-500">Prepare, consulte e acompanhe documentos da loja atual.</p></div><Link href="/configuracoes-fiscais" className="flex h-11 items-center justify-center gap-2 rounded-xl border border-green-700 bg-white px-4 text-xs font-black text-green-800 hover:bg-green-50"><Settings className="size-4" />Configuração fiscal</Link></div>
    <div className="grid gap-3 sm:grid-cols-3"><Metric icon={FileText} label="Documentos" value={documents.length} tone="orange" /><Metric icon={FileClock} label="Preparados ou pendentes" value={pending} tone="amber" /><Metric icon={FileCheck2} label="Autorizados pela SEFAZ" value={authorized} tone="green" /></div>
    {!readiness?.readyToPrepare && <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4"><div className="flex items-start gap-3"><AlertTriangle className="size-5 shrink-0 text-amber-700" /><div><p className="text-xs font-black text-amber-950">Complete a estrutura fiscal antes de preparar notas</p><ul className="mt-2 list-inside list-disc text-[10px] text-amber-900">{readiness?.errors.map((item) => <li key={item}>{item}</li>)}</ul><Link href="/configuracoes-fiscais" className="mt-3 inline-flex text-[10px] font-black text-amber-900 underline">Abrir configuração fiscal</Link></div></div></div>}
    {readiness?.readyToPrepare && !readiness.readyToTransmit && <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-[10px] font-semibold text-green-800"><CheckCircle2 className="mr-2 inline size-4" />A preparação está liberada. Conecte o token da Focus NFe para transmitir em homologação.</div>}
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center gap-3"><div className="flex size-10 items-center justify-center rounded-xl bg-orange-100 text-orange-700"><Plus className="size-4" /></div><div><h2 className="text-sm font-black text-slate-950">Preparar documento de uma venda</h2><p className="text-[10px] text-slate-500">A preparação cria um snapshot imutável; não consome numeração fiscal.</p></div></div><div className="mt-4 grid gap-3 lg:grid-cols-[180px_1fr_auto]"><select value={type} onChange={(event) => { setType(event.target.value as FiscalDocumentType); setSaleId(""); }} className={fieldClass}><option value="NFCE">NFC-e · consumidor</option><option value="NFE">NF-e · empresa/órgão</option></select><select value={saleId} onChange={(event) => setSaleId(event.target.value)} className={fieldClass}><option value="">Selecione uma venda concluída</option>{eligibleSales.map((sale) => <option key={sale.id} value={sale.id}>{sale.code} · {sale.customerName} · {formatCurrency(sale.total)}</option>)}</select><button type="button" disabled={saving || !saleId || !readiness?.readyToPrepare} onClick={() => void prepare()} className="flex h-11 items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 text-xs font-black text-white disabled:opacity-40">{saving ? <LoaderCircle className="size-4 animate-spin" /> : <ReceiptText className="size-4" />}Preparar</button></div></article>
    {errorMessage && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-bold text-red-800">{errorMessage}</div>}{message && <div role="status" className="rounded-xl border border-green-200 bg-green-50 p-3 text-xs font-bold text-green-800">{message}</div>}
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-200 px-5 py-4"><h2 className="text-sm font-black text-slate-950">Histórico fiscal</h2><p className="mt-1 text-[10px] text-slate-500">Documentos e eventos armazenados por unidade.</p></div>{documents.length ? <div className="divide-y divide-slate-100">{documents.map((document) => <details key={document.id} className="group"><summary className="flex cursor-pointer list-none items-center gap-3 px-5 py-4 hover:bg-slate-50"><span className="flex size-9 items-center justify-center rounded-xl bg-orange-50 text-orange-700"><FileText className="size-4" /></span><div className="min-w-0 flex-1"><p className="truncate text-xs font-black text-slate-900">{document.type === "NFE" ? "NF-e" : "NFC-e"} · Venda #{String(document.sale?.number ?? 0).padStart(6,"0")}</p><p className="mt-1 text-[9px] text-slate-500">Série {document.series} · {formatDateTime(new Date(document.createdAt))} · {document.createdByName}</p></div><strong className="text-xs text-slate-950">{formatCurrency(document.total)}</strong><Status value={document.status} /><ChevronDown className="size-4 text-slate-400 transition group-open:rotate-180" /></summary><div className="border-t border-slate-100 bg-slate-50 px-5 py-4"><div className="grid gap-3 sm:grid-cols-3"><Info label="Ambiente" value={document.environment === "HOMOLOGATION" ? "Homologação" : "Produção"} /><Info label="Número" value={document.number ? String(document.number) : "Ainda não atribuído"} /><Info label="Chave de acesso" value={document.accessKey ?? "Aguardando transmissão"} /></div>{document.rejectionMessage && <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-[10px] font-bold text-red-800">{document.rejectionCode ? `${document.rejectionCode} · ` : ""}{document.rejectionMessage}</div>}<div className="mt-4 flex flex-wrap gap-2">{["READY","REJECTED"].includes(document.status) && <ActionButton disabled={!readiness?.readyToTransmit || actingId === document.id} icon={Send} label="Emitir na SEFAZ" onClick={() => void fiscalAction(document,"issue")} />}{document.providerReference && !["CANCELLED"].includes(document.status) && <ActionButton disabled={actingId === document.id} icon={RefreshCw} label="Consultar" onClick={() => void fiscalAction(document,"consult")} />}{document.status === "AUTHORIZED" && <ActionButton danger disabled={actingId === document.id} icon={Ban} label="Cancelar nota" onClick={() => void fiscalAction(document,"cancel")} />}{document.danfeUrl && <a href={document.danfeUrl} target="_blank" rel="noreferrer" className={actionClass}><ExternalLink className="size-3.5" />Abrir DANFE</a>}{document.xmlUrl && <a href={document.xmlUrl} target="_blank" rel="noreferrer" className={actionClass}><ExternalLink className="size-3.5" />Baixar XML</a>}</div><div className="mt-4 overflow-x-auto"><table className="w-full min-w-[600px] text-left text-[10px]"><thead className="text-slate-500"><tr><th className="pb-2">Item</th><th>NCM</th><th>CFOP</th><th>Qtd.</th><th className="text-right">Total</th></tr></thead><tbody className="divide-y divide-slate-200">{document.items.map((item) => <tr key={item.id}><td className="py-2 font-bold text-slate-800">{item.name}</td><td>{item.ncm}</td><td>{item.cfop}</td><td>{item.quantity}</td><td className="text-right font-bold">{formatCurrency(item.total)}</td></tr>)}</tbody></table></div><div className="mt-4 border-l-2 border-green-300 pl-3">{document.events.map((event) => <p key={event.id} className="text-[10px] text-slate-600"><strong>{formatDateTime(new Date(event.createdAt))}</strong> · {event.description}</p>)}</div></div></details>)}</div> : <div className="p-12 text-center"><ReceiptText className="mx-auto size-6 text-slate-300" /><p className="mt-3 text-xs font-bold text-slate-600">Nenhum documento fiscal preparado.</p></div>}</article>
  </section>;
}

const fieldClass = "h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-xs font-bold text-slate-800 outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100";
const statusLabels: Record<FiscalDocumentStatus,string> = { DRAFT:"Rascunho", READY:"Preparada", PROCESSING:"Processando", AUTHORIZED:"Autorizada", REJECTED:"Rejeitada", CANCELLED:"Cancelada", ERROR:"Erro" };
function Status({ value }: { value:FiscalDocumentStatus }) { const colors = value === "AUTHORIZED" ? "bg-green-100 text-green-800" : value === "REJECTED" || value === "ERROR" ? "bg-red-100 text-red-800" : value === "CANCELLED" ? "bg-slate-200 text-slate-700" : "bg-amber-100 text-amber-800"; return <span className={`rounded-full px-2.5 py-1 text-[9px] font-black ${colors}`}>{statusLabels[value]}</span>; }
function Metric({ icon:Icon,label,value,tone }: { icon:typeof FileText; label:string; value:number; tone:"orange"|"amber"|"green" }) { const colors={orange:"bg-orange-100 text-orange-700",amber:"bg-amber-100 text-amber-700",green:"bg-green-100 text-green-700"}; return <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className={`flex size-9 items-center justify-center rounded-xl ${colors[tone]}`}><Icon className="size-4" /></div><p className="mt-3 text-[10px] font-semibold text-slate-500">{label}</p><p className="mt-1 text-xl font-black text-slate-950">{value}</p></div>; }
function Info({label,value}:{label:string;value:string}) { return <div className="rounded-xl border border-slate-200 bg-white p-3"><p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">{label}</p><p className="mt-1 break-all text-[10px] font-bold text-slate-800">{value}</p></div>; }
const actionClass = "inline-flex h-9 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-[10px] font-black text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40";
function ActionButton({ icon:Icon, label, onClick, disabled, danger=false }: { icon:typeof Send; label:string; onClick:()=>void; disabled?:boolean; danger?:boolean }) { return <button type="button" disabled={disabled} onClick={onClick} className={`${actionClass} ${danger ? "border-red-300 text-red-700 hover:bg-red-50" : ""}`}><Icon className="size-3.5" />{label}</button>; }
