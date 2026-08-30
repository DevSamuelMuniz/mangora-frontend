"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, FileKey2, KeyRound, LoaderCircle, Save, ShieldCheck } from "lucide-react";
import { useConnectFiscalProvider, useFiscalSettings, useSaveFiscalSettings } from "@/features/fiscal/hooks/useFiscal";

export default function FiscalSettingsPanel() {
  const { data: overview, isLoading: loading, error: loadError } = useFiscalSettings();
  const saveMutation = useSaveFiscalSettings();
  const connectMutation = useConnectFiscalProvider();
  const saving = saveMutation.isPending;
  const connecting = connectMutation.isPending;
  const data = overview?.data ?? null;
  const readiness = overview?.readiness ?? null;
  const [providerToken, setProviderToken] = useState("");
  const [actionError, setActionError] = useState("");
  const [message, setMessage] = useState("");

  const errorMessage = actionError || (loadError instanceof Error ? loadError.message : "");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setActionError(""); setMessage("");
    const form = new FormData(event.currentTarget);
    const optional = (name: string) => String(form.get(name) ?? "").trim() || null;
    try {
      await saveMutation.mutateAsync({
        enabled: form.get("enabled") === "on", environment: form.get("environment"), taxRegime: form.get("taxRegime"),
        stateRegistration: optional("stateRegistration"), municipalRegistration: optional("municipalRegistration"), cnae: optional("cnae"),
        nfeSeries: Number(form.get("nfeSeries")), nfceSeries: Number(form.get("nfceSeries")),
        nextNfeNumber: Number(form.get("nextNfeNumber")), nextNfceNumber: Number(form.get("nextNfceNumber")),
        cscId: optional("cscId"), certificateLabel: optional("certificateLabel"), certificateExpiresAt: optional("certificateExpiresAt"),
      });
      setMessage("Configuração fiscal salva para esta loja.");
    } catch (cause) { setActionError(cause instanceof Error ? cause.message : "Não foi possível salvar a configuração."); }
  }

  async function connectProvider() {
    if (!providerToken.trim()) return;
    setActionError(""); setMessage("");
    try {
      const result = await connectMutation.mutateAsync({ token: providerToken.trim() });
      setProviderToken("");
      setMessage(`Focus NFe conectada em ${result.settings.environment === "HOMOLOGATION" ? "homologação" : "produção"}.`);
    } catch (cause) { setActionError(cause instanceof Error ? cause.message : "Não foi possível conectar a Focus NFe."); }
  }

  if (loading) return <div className="flex min-h-72 items-center justify-center"><LoaderCircle className="size-5 animate-spin text-orange-600" /><span className="ml-2 text-xs font-bold text-slate-600">Carregando configuração fiscal...</span></div>;
  if (!data) return <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-bold text-red-800">{errorMessage || "Configuração indisponível."}</div>;
  const { company, settings } = data;

  return <section className="mx-auto max-w-6xl space-y-5"><div><p className="text-[11px] font-black uppercase tracking-[0.14em] text-orange-600">Fiscal por unidade</p><h1 className="mt-1 text-2xl font-black text-slate-950 sm:text-3xl">Configuração fiscal</h1><p className="mt-1 text-xs text-slate-500">Dados exclusivos de {company.tradeName}. Confirme a tributação com o contador.</p></div>
    <div className={`rounded-2xl border p-4 ${readiness?.readyToPrepare ? "border-green-300 bg-green-50" : "border-amber-300 bg-amber-50"}`}><div className="flex items-start gap-3">{readiness?.readyToPrepare ? <CheckCircle2 className="size-5 text-green-700" /> : <AlertTriangle className="size-5 text-amber-700" />}<div><p className="text-xs font-black text-slate-950">{readiness?.readyToPrepare ? "Loja pronta para preparar documentos" : "Configuração ainda incompleta"}</p><p className="mt-1 text-[10px] text-slate-600">{readiness?.products.incomplete ?? 0} de {readiness?.products.total ?? 0} produtos possuem dados fiscais pendentes.</p>{Boolean(readiness?.errors.length) && <ul className="mt-2 list-inside list-disc text-[10px] text-amber-900">{readiness?.errors.map((item) => <li key={item}>{item}</li>)}</ul>}</div></div></div>
    <form key={`${settings.environment}-${settings.nfeSeries}-${settings.nfceSeries}`} onSubmit={(event) => void submit(event)} className="space-y-4">
      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center gap-3 border-b border-slate-100 pb-4"><ShieldCheck className="size-5 text-green-700" /><div><h2 className="text-sm font-black text-slate-950">Emitente e ambiente</h2><p className="text-[10px] text-slate-500">CNPJ, razão social e endereço vêm dos dados da empresa.</p></div></div><div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><ReadOnly label="CNPJ" value={company.document ?? "Não informado"} /><ReadOnly label="Razão social" value={company.legalName ?? "Não informada"} /><Field label="Inscrição estadual" name="stateRegistration" defaultValue={settings.stateRegistration} /><Field label="Inscrição municipal" name="municipalRegistration" defaultValue={settings.municipalRegistration} /><Field label="CNAE principal" name="cnae" defaultValue={settings.cnae} /><Select label="Regime tributário" name="taxRegime" defaultValue={settings.taxRegime} options={[["SIMPLES_NACIONAL","Simples Nacional"],["SIMPLES_EXCESSO","Simples — excesso de sublimite"],["REGULAR","Regime normal"]]} /><Select label="Ambiente" name="environment" defaultValue={settings.environment} options={[["HOMOLOGATION","Homologação — sem validade"],["PRODUCTION","Produção — validade fiscal"]]} /><label className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-3"><input type="checkbox" name="enabled" defaultChecked={settings.enabled} className="size-4 accent-orange-600" /><span><strong className="block text-xs text-green-950">Ativar preparação fiscal</strong><span className="text-[9px] text-green-700">Não transmite sem provedor.</span></span></label></div><Link href="/configuracoes?secao=empresa" className="mt-4 inline-flex text-[10px] font-black text-orange-700 underline">Corrigir dados cadastrais da empresa</Link></article>
      <div className="grid gap-4 lg:grid-cols-2"><article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center gap-2"><FileKey2 className="size-4 text-orange-600" /><h2 className="text-sm font-black text-slate-950">Numeração por modelo</h2></div><div className="mt-4 grid grid-cols-2 gap-4"><Field label="Série NF-e" name="nfeSeries" type="number" defaultValue={settings.nfeSeries} /><Field label="Próxima NF-e" name="nextNfeNumber" type="number" defaultValue={settings.nextNfeNumber} /><Field label="Série NFC-e" name="nfceSeries" type="number" defaultValue={settings.nfceSeries} /><Field label="Próxima NFC-e" name="nextNfceNumber" type="number" defaultValue={settings.nextNfceNumber} /></div></article><article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between gap-3"><div><h2 className="text-sm font-black text-slate-950">Integração Focus NFe</h2><p className="mt-1 text-[10px] text-slate-500">O token é validado e armazenado com criptografia AES-256.</p></div><span className={`rounded-full px-2.5 py-1 text-[9px] font-black ${settings.providerConnected ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`}>{settings.providerConnected ? "Conectada" : "Não conectada"}</span></div><div className="mt-4 flex gap-2"><label className="min-w-0 flex-1 text-[10px] font-bold text-slate-700">Token do ambiente<input type="password" autoComplete="off" value={providerToken} onChange={(event) => setProviderToken(event.target.value)} placeholder={settings.providerConnected ? "Informe apenas para substituir" : "Cole o token da Focus NFe"} className={fieldClass} /></label><button type="button" disabled={connecting || !providerToken.trim()} onClick={() => void connectProvider()} className="mt-[21px] flex h-11 shrink-0 items-center gap-2 rounded-xl border border-green-700 bg-green-50 px-3 text-[10px] font-black text-green-800 disabled:opacity-40">{connecting ? <LoaderCircle className="size-4 animate-spin" /> : <KeyRound className="size-4" />}Conectar</button></div><div className="mt-4 grid gap-4 sm:grid-cols-2"><Field label="Identificação do CSC" name="cscId" defaultValue={settings.cscId} /><Field label="Certificado na Focus" name="certificateLabel" defaultValue={settings.certificateLabel} placeholder="Ex.: A1 válido até 2027" /><Field label="Validade do certificado" name="certificateExpiresAt" type="date" defaultValue={settings.certificateExpiresAt?.slice(0,10)} /></div></article></div>
      {errorMessage && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-bold text-red-800">{errorMessage}</div>}{message && <div role="status" className="rounded-xl border border-green-200 bg-green-50 p-3 text-xs font-bold text-green-800">{message}</div>}<div className="flex justify-end"><button type="submit" disabled={saving} className="flex h-11 items-center gap-2 rounded-xl bg-orange-600 px-5 text-xs font-black text-white shadow-lg shadow-orange-200 disabled:opacity-50">{saving ? <LoaderCircle className="size-4 animate-spin" /> : <Save className="size-4" />}Salvar configuração fiscal</button></div>
    </form>
  </section>;
}

const fieldClass = "mt-1.5 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100";
function Field({ label, name, defaultValue, type="text", placeholder }: { label:string; name:string; defaultValue?: string | number | null; type?:string; placeholder?:string }) { return <label className="text-[10px] font-bold text-slate-700">{label}<input name={name} type={type} min={type === "number" ? 1 : undefined} defaultValue={defaultValue ?? ""} placeholder={placeholder} className={fieldClass} /></label>; }
function Select({ label, name, defaultValue, options }: { label:string; name:string; defaultValue:string; options:string[][] }) { return <label className="text-[10px] font-bold text-slate-700">{label}<select name={name} defaultValue={defaultValue} className={fieldClass}>{options.map(([value,text]) => <option key={value} value={value}>{text}</option>)}</select></label>; }
function ReadOnly({ label, value }: { label:string; value:string }) { return <div><p className="text-[10px] font-bold text-slate-700">{label}</p><div className="mt-1.5 flex h-11 items-center rounded-xl border border-slate-200 bg-slate-100 px-3 text-xs font-bold text-slate-700">{value}</div></div>; }
