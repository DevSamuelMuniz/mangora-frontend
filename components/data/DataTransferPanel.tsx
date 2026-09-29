"use client";

import { useState } from "react";
import { useT } from "@/i18n/provider";
import type { Translate } from "@/i18n/runtime";
import { Download, FileSpreadsheet, LoaderCircle, Package, Upload, Users, Warehouse } from "lucide-react";

import { downloadCsv, useImportCsv, type ImportKind } from "@/features/data/hooks/useDataTransfer";

function buildImportKinds(t: Translate): { kind: ImportKind; label: string; icon: typeof Package; hint: string }[] {
  return [
    { kind: "products", label: t("modules.dataTransfer.products"), icon: Package, hint: t("modules.dataTransfer.productsHint") },
    { kind: "customers", label: t("modules.dataTransfer.customers"), icon: Users, hint: t("modules.dataTransfer.customersHint") },
    { kind: "suppliers", label: t("modules.dataTransfer.suppliers"), icon: Warehouse, hint: t("modules.dataTransfer.suppliersHint") },
  ];
}

export default function DataTransferPanel() {
  const t = useT();
  const importKinds = buildImportKinds(t);
  const [kind, setKind] = useState<ImportKind>("products");
  const [content, setContent] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const importCsv = useImportCsv(kind);

  async function runImport() {
    if (!content.trim()) {
      setError(t("workspace.data.emptyCsv"));
      return;
    }
    try {
      setError("");
      const result = await importCsv.mutateAsync(content);
      setNotice(`Importado ${result.imported} · ignorado ${result.skipped}.${result.errors.length ? ` Primeiros erros: ${result.errors.slice(0, 3).join(" ")}` : ""}`);
      setContent("");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : t("workspace.data.importFailed"));
    }
  }

  async function runDownload(target: ImportKind) {
    try {
      setError("");
      await downloadCsv(target);
      setNotice(`Arquivo ${target}.csv gerado e baixado.`);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : t("workspace.data.downloadFailed"));
    }
  }

  return (
    <section className="mx-auto max-w-5xl">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-orange-600">{t("workspace.data.title")}</p>
        <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">{t("workspace.data.importTitle")}</h1>
        <p className="mt-1 text-xs text-slate-500">{t("workspace.data.subtitle")}</p>
      </div>

      {notice && <div role="status" className="mt-4 flex items-center justify-between rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-xs font-semibold text-green-700"><span>{notice}</span><button type="button" onClick={() => setNotice("")} className="font-bold underline">Fechar</button></div>}
      {error && <div role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">{error}</div>}

      <div className="mt-5 grid items-start gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="flex size-9 items-center justify-center rounded-xl bg-green-50 text-green-600"><Download className="size-4" /></div>
            <div><h2 className="text-sm font-bold text-slate-950">{t("workspace.data.download")}</h2><p className="mt-0.5 text-[10px] text-slate-400">{t("workspace.data.csvReady")}</p></div>
          </div>
          <div className="mt-4 space-y-2">
            {importKinds.map((entry) => (
              <button key={entry.kind} type="button" onClick={() => void runDownload(entry.kind)} className="flex w-full items-center gap-3 rounded-xl border border-slate-200 p-3 text-left transition hover:border-green-300 hover:bg-green-50/40">
                <span className="flex size-9 items-center justify-center rounded-lg bg-slate-50 text-slate-500"><FileSpreadsheet className="size-4" /></span>
                <span className="min-w-0 flex-1"><span className="block text-xs font-bold text-slate-800">{entry.label}.csv</span><span className="mt-0.5 block text-[10px] text-slate-400">{t("workspace.data.template")}</span></span>
                <Download className="size-4 text-green-600" />
              </button>
            ))}
          </div>
        </article>

        <article className="rounded-2xl border-2 border-dashed border-amber-200 bg-amber-50/40 p-4 shadow-sm sm:p-5">
          <div className="flex items-center gap-3 border-b border-amber-100 pb-4">
            <div className="flex size-9 items-center justify-center rounded-xl bg-amber-500 text-white"><Upload className="size-4" /></div>
            <div><h2 className="text-sm font-bold text-slate-950">{t("workspace.data.eyebrow")}</h2><p className="mt-0.5 text-[10px] text-slate-500">{t("workspace.data.importHint")}</p></div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {importKinds.map((entry) => (
              <button key={entry.kind} type="button" onClick={() => { setKind(entry.kind); setNotice(""); setError(""); }} className={`inline-flex h-9 items-center gap-2 rounded-xl px-3 text-xs font-bold ${kind === entry.kind ? "bg-amber-500 text-white" : "border border-amber-200 bg-white text-amber-700 hover:bg-amber-100"}`}><entry.icon className="size-3.5" />{entry.label}</button>
            ))}
          </div>
          <textarea value={content} onChange={(event) => setContent(event.target.value)} rows={6} placeholder={importKinds.find((entry) => entry.kind === kind)?.hint} className="mt-3 w-full resize-y rounded-xl border border-amber-200 bg-white p-3.5 font-mono text-[11px] leading-5 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-amber-400 focus:ring-4 focus:ring-amber-100" />
          <div className="mt-3 flex items-center justify-between gap-3">
            <p className="text-[10px] text-amber-700">{t("workspace.data.duplicates")}</p>
            <button type="button" onClick={() => void runImport()} disabled={importCsv.isPending || !content.trim()} className="inline-flex h-10 items-center gap-2 rounded-xl bg-amber-500 px-4 text-xs font-bold text-white hover:bg-amber-600 disabled:opacity-50">{importCsv.isPending ? <LoaderCircle className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}Importar</button>
          </div>
        </article>
      </div>
    </section>
  );
}
