"use client";

import { useRef, useState } from "react";
import { useT } from "@/i18n/provider";
import { savePrintPreferences, type PrintPreferences } from "@/lib/printing/preferences";
import { usePrintPreferences } from "@/lib/printing/use-print-preferences";
import { findPrinters, submitPrintJob } from "@/lib/printing/service";
import { usePrintScope } from "@/lib/printing/scope";
import { printErrorMessage, printResultMessage } from "@/lib/printing/messages";
import type { PrintKind } from "@/lib/printing/types";

const field = "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 focus-visible:outline-2 focus-visible:outline-orange-600";
const action = "min-h-11 cursor-pointer rounded-xl border border-slate-300 px-3 font-semibold hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-orange-600 active:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50";

export default function PrintSettings({ kind, embedded = false }: { kind: PrintKind; embedded?: boolean }) {
  const t = useT();
  const scope = usePrintScope();
  const preferences = usePrintPreferences();
  const [printers, setPrinters] = useState<string[]>([]);
  const [busy, setBusy] = useState<"discover" | "test" | null>(null);
  const actionLock = useRef(false);
  const [message, setMessage] = useState("");
  function update(patch: Partial<PrintPreferences>) {
    try { savePrintPreferences(patch, scope); setMessage(t("labels.settingsSaved")); }
    catch { setMessage(t("labels.settingsError")); }
  }
  async function run(operation: "discover" | "test") {
    if (actionLock.current) return;
    actionLock.current = true;
    setBusy(operation); setMessage("");
    try {
      if (operation === "test") {
        setMessage(printResultMessage(t, await submitPrintJob({ kind: "test", target: kind }, { scope })));
      } else {
        const found = await findPrinters();
        setPrinters(found);
        setMessage(t(found.length ? "labels.printersFound" : "labels.noPrinters"));
      }
    } catch (cause) {
      setMessage(printErrorMessage(t, cause, operation === "discover" ? "labels.connectionError" : "labels.printError"));
    } finally {
      actionLock.current = false;
      setBusy(null);
    }
  }
  const printerKey = kind === "label" ? "labelPrinter" : "receiptPrinter";
  const options = [...new Set([preferences[printerKey], ...printers].filter(Boolean))];
  const direct = preferences.transport === "qz";
  const raw = direct && kind === "receipt" && preferences.receiptProtocol === "escpos";
  const fields = <fieldset disabled={busy !== null} className="mt-4 min-w-0 space-y-3 text-sm">
      <label className="block space-y-1"><span>{t("labels.printerProfile")}</span><select className={field} value={preferences.printerProfile} onChange={event => update(event.target.value === "knup-kp1025" ? { printerProfile: "knup-kp1025", receiptWidth: 58, labelWidth: 48, labelHeight: 30, labelPaper: "continuous", receiptProtocol: "pixel", receiptCutter: false, receiptCut: false, receiptQr: false } : { printerProfile: "generic" })}>
        <option value="generic">{t("labels.genericProfile")}</option><option value="knup-kp1025">Knup KP-1025</option>
      </select></label>
      {preferences.printerProfile === "knup-kp1025" && <p className="text-xs leading-5 text-slate-600">{t("labels.knupHint")}</p>}
      <label className="block space-y-1"><span>{t("labels.printMethod")}</span><select className={field} value={preferences.transport} onChange={event => update({ transport: event.target.value as PrintPreferences["transport"] })}>
        <option value="browser">{t("labels.browserPrint")}</option><option value="qz">{t("labels.directPrint")}</option>
      </select></label>
      {direct && <>
        <p className="text-xs leading-5 text-slate-600">{t("labels.qzHint")} <a href="https://qz.io/download/" target="_blank" rel="noreferrer" className="font-bold text-orange-700 underline">{t("labels.installQz")}</a></p>
        <button type="button" aria-busy={busy === "discover"} onClick={() => void run("discover")} className={action}>{t(busy === "discover" ? "labels.connecting" : "labels.findPrinters")}</button>
        <label className="block space-y-1"><span>{t("labels.printer")}</span><select className={field} value={preferences[printerKey]} onChange={event => update(kind === "receipt" ? { receiptPrinter: event.target.value, receiptProtocol: "pixel", receiptCutter: false, receiptCut: false, receiptQr: false } : { labelPrinter: event.target.value })}><option value="">{t("labels.choosePrinter")}</option>{options.map(name => <option key={name}>{name}</option>)}</select></label>
        {kind === "receipt" && preferences.printerProfile !== "knup-kp1025" && <label className="block space-y-1"><span>{t("labels.protocol")}</span><select disabled={!preferences.receiptPrinter} className={field} value={preferences.receiptProtocol} onChange={event => update({ receiptProtocol: event.target.value === "escpos" ? "escpos" : "pixel" })}><option value="pixel">{t("labels.pixel")}</option><option value="escpos">ESC/POS (RAW)</option></select></label>}
        {raw ? <>
          <p className="text-xs leading-5 text-slate-600">{t("labels.rawHint")}</p>
          <label className="block space-y-1"><span>{t("labels.encoding")}</span><select className={field} value={preferences.receiptEncoding} onChange={event => update({ receiptEncoding: event.target.value === "cp858" ? "cp858" : "cp850" })}><option value="cp850">PC850</option><option value="cp858">PC858</option></select></label>
          <label className="flex min-h-8 cursor-pointer items-center gap-2"><input type="checkbox" checked={preferences.receiptCutter} onChange={event => update({ receiptCutter: event.target.checked, receiptCut: false })} />{t("labels.cutter")}</label>
          {preferences.receiptCutter && <label className="flex min-h-8 cursor-pointer items-center gap-2"><input type="checkbox" checked={preferences.receiptCut} onChange={event => update({ receiptCut: event.target.checked })} />{t("labels.cut")}</label>}
          <label className="flex min-h-8 cursor-pointer items-center gap-2"><input type="checkbox" checked={preferences.receiptQr} onChange={event => update({ receiptQr: event.target.checked })} />{t("labels.qr")}</label>
        </> : <label className="flex min-h-8 cursor-pointer items-center gap-2"><input type="checkbox" checked={preferences.rasterize} onChange={event => update({ rasterize: event.target.checked })} />{t("labels.rasterize")}</label>}
      </>}
      {kind === "receipt" && <>
        <label className="block space-y-1"><span>{t("labels.receiptWidth")}</span><select className={field} value={preferences.receiptWidth} disabled={preferences.printerProfile === "knup-kp1025"} onChange={event => update({ receiptWidth: Number(event.target.value) as 58 | 80 })}><option value={58}>58 mm</option><option value={80}>80 mm</option></select></label>
        <label className="block space-y-1"><span>{t("labels.copies")}</span><select className={field} value={preferences.receiptCopies} onChange={event => update({ receiptCopies: Number(event.target.value) })}>{[1, 2, 3, 4, 5].map(copies => <option key={copies}>{copies}</option>)}</select></label>
        {!embedded && <label className="flex cursor-pointer items-center gap-2"><input type="checkbox" checked={preferences.autoReceipt} onChange={event => update({ autoReceipt: event.target.checked })} />{t("labels.autoReceipt")}</label>}
      </>}
      <label className="flex cursor-pointer items-center gap-2"><input type="checkbox" checked={preferences.savePdf} onChange={event => update({ savePdf: event.target.checked })} />{t("labels.savePdf")}</label>
      <p className="text-xs leading-5 text-slate-600">{t("labels.downloadHint")}</p>
      <button type="button" disabled={direct && !preferences[printerKey]} aria-busy={busy === "test"} onClick={() => void run("test")} className={action}>{t(busy === "test" ? "labels.printing" : "labels.testPrint")}</button>
      <p role="status" aria-live="polite" className="min-h-10 text-xs leading-5 text-slate-700">{message}</p>
    </fieldset>;
  return embedded ? <section className="rounded-2xl border border-slate-200 bg-white p-4 text-left text-slate-900"><h3 className="text-sm font-bold">{t("labels.printSettings")}</h3>{fields}</section> : <details className="rounded-2xl border border-slate-200 bg-white p-4 text-left text-slate-900"><summary className="cursor-pointer text-sm font-bold focus-visible:outline-2 focus-visible:outline-orange-600">{t("labels.printSettings")}</summary>{fields}</details>;
}
