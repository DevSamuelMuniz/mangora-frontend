"use client";

import { useState } from "react";
import { CalendarRange, Download, FileSpreadsheet, FileText, LoaderCircle, X } from "lucide-react";

import { useT } from "@/i18n/provider";

/**
 * Exportação do relatório financeiro — mês fechado ou período livre, em CSV
 * (Excel) e PDF. Baixa direto do backend, sem passar por estado global.
 */
export default function FinancialReportExport({ onClose }: { onClose: () => void }) {
  const t = useT();
  const today = new Date();
  const [mode, setMode] = useState<"month" | "range">("month");
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [from, setFrom] = useState(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-01`);
  const [to, setTo] = useState(`${today.toISOString().slice(0, 10)}`);
  const [downloading, setDownloading] = useState<"csv" | "pdf" | null>(null);
  const [error, setError] = useState("");

  const query = mode === "month" ? `year=${year}&month=${month}` : `from=${from}&to=${to}`;

  async function download(format: "csv" | "pdf") {
    setDownloading(format);
    setError("");
    try {
      const response = await fetch(`/api/backend/financial/report?${query}&format=${format}`, { credentials: "include" });
      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { message?: string | string[] };
        const message = Array.isArray(payload.message) ? payload.message.join(" ") : payload.message;
        throw new Error(message || t("finance.report.errors.download"));
      }
      const blob = await response.blob();
      const disposition = response.headers.get("content-disposition") ?? "";
      const filename = /filename="([^"]+)"/.exec(disposition)?.[1] ?? `relatorio-financeiro.${format}`;
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t("finance.report.errors.download"));
    } finally {
      setDownloading(null);
    }
  }

  const monthOptions = Array.from({ length: 12 }, (_, index) => index + 1);

  return (
    <div className="fixed inset-0 z-[75] flex items-center justify-center bg-slate-950/50 p-3 backdrop-blur-sm sm:p-5" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div role="dialog" aria-modal="true" aria-labelledby="financial-report-title" className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 bg-gradient-to-r from-orange-50 to-amber-50 px-5 py-4">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-orange-700">{t("finance.report.eyebrow")}</p>
            <h2 id="financial-report-title" className="mt-1 text-lg font-black text-slate-900">{t("finance.report.title")}</h2>
            <p className="mt-1 text-[11px] text-slate-500">{t("finance.report.subtitle")}</p>
          </div>
          <button type="button" aria-label={t("common.actions.close")} onClick={onClose} className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm hover:text-orange-600">
            <X className="size-4" />
          </button>
        </header>

        <div className="p-5">
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setMode("month")} aria-pressed={mode === "month"} className={`h-9 rounded-xl border px-3 text-[11px] font-bold transition ${mode === "month" ? "border-orange-300 bg-orange-50 text-orange-700" : "border-slate-200 bg-white text-slate-600"}`}>
              {t("finance.report.modes.month")}
            </button>
            <button type="button" onClick={() => setMode("range")} aria-pressed={mode === "range"} className={`h-9 rounded-xl border px-3 text-[11px] font-bold transition ${mode === "range" ? "border-orange-300 bg-orange-50 text-orange-700" : "border-slate-200 bg-white text-slate-600"}`}>
              {t("finance.report.modes.range")}
            </button>
          </div>

          {mode === "month" ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="text-[11px] font-bold text-slate-600">{t("finance.report.fields.month")}</span>
                <select aria-label={t("finance.report.fields.month")} value={month} onChange={(event) => setMonth(Number(event.target.value))} className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-700">
                  {monthOptions.map((value) => <option key={value} value={value}>{t(`finance.report.months.${value}`)}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="text-[11px] font-bold text-slate-600">{t("finance.report.fields.year")}</span>
                <select aria-label={t("finance.report.fields.year")} value={year} onChange={(event) => setYear(Number(event.target.value))} className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-700">
                  {[0, 1, 2, 3].map((offset) => <option key={offset} value={today.getFullYear() - offset}>{today.getFullYear() - offset}</option>)}
                </select>
              </label>
            </div>
          ) : (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="text-[11px] font-bold text-slate-600">{t("finance.report.fields.from")}</span>
                <input aria-label={t("finance.report.fields.from")} type="date" value={from} onChange={(event) => setFrom(event.target.value)} className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-700" />
              </label>
              <label className="block">
                <span className="text-[11px] font-bold text-slate-600">{t("finance.report.fields.to")}</span>
                <input aria-label={t("finance.report.fields.to")} type="date" value={to} onChange={(event) => setTo(event.target.value)} className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-700" />
              </label>
            </div>
          )}

          <p className="mt-4 flex items-start gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-[11px] leading-5 text-slate-600">
            <CalendarRange className="mt-0.5 size-3.5 shrink-0 text-orange-600" />
            {t("finance.report.hint")}
          </p>

          {error && <p role="alert" className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">{error}</p>}

          <div className="mt-5 flex flex-col-reverse gap-2.5 sm:flex-row">
            <button type="button" onClick={onClose} className="h-11 flex-1 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-600 hover:bg-slate-50">
              {t("common.actions.close")}
            </button>
            <button type="button" disabled={downloading !== null} onClick={() => void download("csv")} className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-green-200 bg-green-50 text-xs font-black text-green-700 transition hover:bg-green-100 disabled:opacity-50">
              {downloading === "csv" ? <LoaderCircle className="size-4 animate-spin" /> : <FileSpreadsheet className="size-4" />}
              {t("finance.report.actions.csv")}
            </button>
            <button type="button" disabled={downloading !== null} onClick={() => void download("pdf")} className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 text-xs font-black text-white shadow-md shadow-orange-200 transition hover:-translate-y-0.5 disabled:opacity-50">
              {downloading === "pdf" ? <LoaderCircle className="size-4 animate-spin" /> : <FileText className="size-4" />}
              {t("finance.report.actions.pdf")}
            </button>
          </div>

          <p className="mt-3 flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
            <Download className="size-3" />
            {t("finance.report.footer")}
          </p>
        </div>
      </div>
    </div>
  );
}
