"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { LoaderCircle, Printer, X } from "lucide-react";
import { useT } from "@/i18n/provider";
import { usePrintPreferences } from "@/lib/printing/use-print-preferences";
import PrintSettings from "./PrintSettings";

type Props = {
  kind: "label" | "receipt";
  title: string;
  children: ReactNode;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  canConfirm?: boolean;
};

/** Preparation alone has no print/download side effects. Only confirmation sends a job. */
export default function PrintDialog({ kind, title, children, onClose, onConfirm, canConfirm = true }: Props) {
  const t = useT();
  const preferences = usePrintPreferences();
  const dialog = useRef<HTMLDialogElement>(null);
  const lock = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const printer = kind === "label" ? preferences.labelPrinter : preferences.receiptPrinter;
  const missingPrinter = preferences.transport === "qz" && !printer;
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const element = dialog.current;
    element?.showModal();
    return () => { element?.close(); document.body.style.overflow = previousOverflow; previous?.focus(); };
  }, []);

  async function confirm() {
    if (lock.current || !canConfirm || missingPrinter) return;
    lock.current = true;
    setBusy(true); setError("");
    try { await onConfirm(); onClose(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : t("labels.printError")); }
    finally { lock.current = false; setBusy(false); }
  }

  return <dialog ref={dialog} aria-labelledby="print-dialog-title" onCancel={event => { if (lock.current) event.preventDefault(); else onClose(); }} className="fixed m-auto max-h-[92dvh] w-[calc(100%_-_2rem)] max-w-5xl overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50 p-0 text-slate-900 shadow-2xl backdrop:bg-slate-950/50 backdrop:backdrop-blur-sm">
    <header className="flex items-start justify-between gap-4 border-b border-slate-200 bg-white px-5 py-4">
      <div><p className="text-xs font-bold text-orange-700">{t("labels.dialog.eyebrow")}</p><h2 id="print-dialog-title" className="mt-1 text-xl font-black">{title}</h2><p className="mt-1 text-xs leading-5 text-slate-500">{t("labels.dialog.hint")}</p></div>
      <button type="button" disabled={busy} aria-label={t("labels.dialog.close")} onClick={onClose} className="grid size-10 shrink-0 cursor-pointer place-items-center rounded-xl hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-orange-600 disabled:cursor-wait disabled:opacity-50"><X className="size-5" /></button>
    </header>
    <div className="grid items-start gap-5 p-5 md:grid-cols-[minmax(0,1fr)_320px]">
      <fieldset disabled={busy} className="min-w-0 space-y-4 disabled:opacity-60">{children}</fieldset>
      <aside className="min-w-0 space-y-4">
        <section className="rounded-2xl border border-orange-200 bg-orange-50 p-4">
          <h3 className="flex items-center gap-2 text-sm font-bold"><Printer className="size-4 text-orange-700" />{t("labels.dialog.device")}</h3>
          <dl className="mt-3 space-y-3 text-xs">
            <div><dt className="text-slate-500">{t("labels.printerProfile")}</dt><dd className="mt-1 font-bold">{preferences.printerProfile === "knup-kp1025" ? "Knup KP-1025" : t("labels.genericProfile")}</dd></div>
            <div><dt className="text-slate-500">{t("labels.printer")}</dt><dd className="mt-1 break-words font-bold">{preferences.transport === "browser" ? t("labels.dialog.browserDevice") : printer || t("labels.choosePrinter")}</dd></div>
            {preferences.printerProfile === "knup-kp1025" && <div><dt className="text-slate-500">{t("labels.dialog.media")}</dt><dd className="mt-1 font-bold">{t("labels.dialog.knupMedia")}</dd></div>}
          </dl>
        </section>
        <fieldset disabled={busy} className="min-w-0 disabled:opacity-60"><PrintSettings kind={kind} embedded /></fieldset>
      </aside>
    </div>
    <footer className="sticky bottom-0 border-t border-slate-200 bg-white px-5 py-4">
      <div className="min-h-5 text-xs" aria-live="polite">{error ? <p role="alert" className="font-semibold text-red-700">{error}</p> : missingPrinter ? <p className="text-amber-800">{t("labels.dialog.selectPrinterHint")}</p> : busy ? <p role="status" className="text-slate-600">{t("labels.printing")}</p> : null}</div>
      <div className="mt-3 flex flex-wrap justify-end gap-3">
        <button type="button" disabled={busy} onClick={onClose} className="h-11 cursor-pointer rounded-xl border border-slate-300 px-4 text-sm font-bold hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-orange-600 disabled:cursor-wait disabled:opacity-50">{t("labels.dialog.cancel")}</button>
        <button type="button" disabled={busy || !canConfirm || missingPrinter} aria-busy={busy} onClick={() => void confirm()} className="flex h-11 min-w-48 cursor-pointer items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 text-sm font-bold text-white hover:bg-orange-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 disabled:cursor-not-allowed disabled:opacity-50">{busy ? <LoaderCircle className="size-4 animate-spin" /> : <Printer className="size-4" />}{t("labels.dialog.confirm")}</button>
      </div>
    </footer>
  </dialog>;
}
