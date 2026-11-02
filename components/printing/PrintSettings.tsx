"use client";

import { useState } from "react";
import { useT } from "@/i18n/provider";
import { savePrintPreferences, type PrintPreferences } from "@/lib/printing/preferences";
import { usePrintPreferences } from "@/lib/printing/use-print-preferences";
import { findPrinters } from "@/lib/printing/service";

const field = "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 focus-visible:outline-2 focus-visible:outline-orange-600";

export default function PrintSettings({ kind }: { kind: "label" | "receipt" }) {
  const t = useT();
  const preferences = usePrintPreferences();
  const [printers, setPrinters] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  function update(patch: Partial<PrintPreferences>) {
    try { savePrintPreferences(patch); setMessage(t("labels.settingsSaved")); }
    catch { setMessage(t("labels.settingsError")); }
  }
  async function discover() {
    if (busy) return;
    setBusy(true); setMessage("");
    try {
      const found = await findPrinters();
      setPrinters(found);
      setMessage(t(found.length ? "labels.printersFound" : "labels.noPrinters"));
    } catch { setMessage(t("labels.connectionError")); }
    finally { setBusy(false); }
  }
  const printerKey = kind === "label" ? "labelPrinter" : "receiptPrinter";
  const options = [...new Set([preferences[printerKey], ...printers].filter(Boolean))];
  return <details className="rounded-2xl border border-slate-200 bg-white p-4 text-left text-slate-900">
    <summary className="cursor-pointer text-sm font-bold focus-visible:outline-2 focus-visible:outline-orange-600">{t("labels.printSettings")}</summary>
    <div className="mt-4 space-y-3 text-sm">
      <label className="block space-y-1"><span>{t("labels.printerProfile")}</span><select className={field} value={preferences.printerProfile} onChange={event => update(event.target.value === "knup-kp1025" ? { printerProfile: "knup-kp1025", receiptWidth: 58, labelWidth: 48, labelHeight: 30, labelPaper: "continuous" } : { printerProfile: "generic" })}>
        <option value="generic">{t("labels.genericProfile")}</option><option value="knup-kp1025">Knup KP-1025</option>
      </select></label>
      {preferences.printerProfile === "knup-kp1025" && <p className="text-xs leading-5 text-slate-600">{t("labels.knupHint")}</p>}
      <label className="block space-y-1"><span>{t("labels.printMethod")}</span><select className={field} value={preferences.transport} onChange={event => update({ transport: event.target.value as PrintPreferences["transport"] })}>
        <option value="browser">{t("labels.browserPrint")}</option><option value="qz">{t("labels.directPrint")}</option>
      </select></label>
      {preferences.transport === "qz" && <>
        <p className="text-xs leading-5 text-slate-600">{t("labels.qzHint")} <a href="https://qz.io/download/" target="_blank" rel="noreferrer" className="font-bold text-orange-700 underline">{t("labels.installQz")}</a></p>
        <button type="button" disabled={busy} aria-busy={busy} onClick={() => void discover()} className="h-11 cursor-pointer rounded-xl border border-slate-300 px-3 font-semibold hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-orange-600 active:bg-slate-200 disabled:cursor-wait disabled:opacity-50">{t(busy ? "labels.connecting" : "labels.findPrinters")}</button>
        <label className="block space-y-1"><span>{t("labels.printer")}</span><select className={field} value={preferences[printerKey]} onChange={event => update({ [printerKey]: event.target.value })}><option value="">{t("labels.choosePrinter")}</option>{options.map(name => <option key={name}>{name}</option>)}</select></label>
      </>}
      {kind === "receipt" && <>
        <label className="block space-y-1"><span>{t("labels.receiptWidth")}</span><select className={field} value={preferences.receiptWidth} disabled={preferences.printerProfile === "knup-kp1025"} onChange={event => update({ receiptWidth: Number(event.target.value) as 58 | 80 })}><option value={58}>58 mm</option><option value={80}>80 mm</option></select></label>
        <label className="flex cursor-pointer items-center gap-2"><input type="checkbox" checked={preferences.autoReceipt} onChange={event => update({ autoReceipt: event.target.checked })} />{t("labels.autoReceipt")}</label>
      </>}
      <label className="flex cursor-pointer items-center gap-2"><input type="checkbox" checked={preferences.savePdf} onChange={event => update({ savePdf: event.target.checked })} />{t("labels.savePdf")}</label>
      <p className="text-xs leading-5 text-slate-600">{t("labels.downloadHint")}</p>
      <p role="status" aria-live="polite" className="min-h-10 text-xs leading-5 text-slate-700">{message}</p>
    </div>
  </details>;
}
