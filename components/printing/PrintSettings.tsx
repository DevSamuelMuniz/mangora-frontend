"use client";

import { useRef, useState } from "react";
import { useT } from "@/i18n/provider";
import { savePrintPreferences, type PrintPreferences } from "@/lib/printing/preferences";
import { usePrintPreferences } from "@/lib/printing/use-print-preferences";
import { submitPrintJob } from "@/lib/printing/service";
import { usePrintScope } from "@/lib/printing/scope";
import { printErrorMessage, printResultMessage } from "@/lib/printing/messages";
import type { PrintKind } from "@/lib/printing/types";

const field = "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 focus-visible:outline-2 focus-visible:outline-orange-600";
const action = "min-h-11 cursor-pointer rounded-xl border border-slate-300 px-3 font-semibold hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-orange-600 active:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50";

export default function PrintSettings({ kind, embedded = false }: { kind: PrintKind; embedded?: boolean }) {
  const t = useT();
  const scope = usePrintScope();
  const preferences = usePrintPreferences();
  const [busy, setBusy] = useState(false);
  const actionLock = useRef(false);
  const [message, setMessage] = useState("");
  function update(patch: Partial<PrintPreferences>) {
    try { savePrintPreferences(patch, scope); setMessage(t("labels.settingsSaved")); }
    catch { setMessage(t("labels.settingsError")); }
  }
  async function testPrint() {
    if (actionLock.current) return;
    actionLock.current = true;
    setBusy(true); setMessage("");
    try {
      setMessage(printResultMessage(t, await submitPrintJob({ kind: "test", target: kind }, { scope })));
    } catch (cause) {
      setMessage(printErrorMessage(t, cause));
    } finally {
      actionLock.current = false;
      setBusy(false);
    }
  }
  const fields = <fieldset disabled={busy} className="mt-4 min-w-0 space-y-3 text-sm">
      {kind === "receipt" && <>
        <label className="block space-y-1"><span>{t("labels.receiptWidth")}</span><select className={field} value={preferences.receiptWidth} onChange={event => update({ receiptWidth: Number(event.target.value) as 58 | 80 })}><option value={58}>58 mm</option><option value={80}>80 mm</option></select></label>
        <label className="block space-y-1"><span>{t("labels.copies")}</span><select className={field} value={preferences.receiptCopies} onChange={event => update({ receiptCopies: Number(event.target.value) })}>{[1, 2, 3, 4, 5].map(copies => <option key={copies}>{copies}</option>)}</select></label>
        {!embedded && <label className="flex cursor-pointer items-center gap-2"><input type="checkbox" checked={preferences.autoReceipt} onChange={event => update({ autoReceipt: event.target.checked })} />{t("labels.autoReceipt")}</label>}
      </>}
      <label className="flex cursor-pointer items-center gap-2"><input type="checkbox" checked={preferences.savePdf} onChange={event => update({ savePdf: event.target.checked })} />{t("labels.savePdf")}</label>
      <p className="text-xs leading-5 text-slate-600">{t("labels.downloadHint")}</p>
      <button type="button" aria-busy={busy} onClick={() => void testPrint()} className={action}>{t(busy ? "labels.printing" : "labels.testPrint")}</button>
      <p role="status" aria-live="polite" className="min-h-10 text-xs leading-5 text-slate-700">{message}</p>
    </fieldset>;
  return embedded ? <section className="rounded-2xl border border-slate-200 bg-white p-4 text-left text-slate-900"><h3 className="text-sm font-bold">{t("labels.printSettings")}</h3>{fields}</section> : <details className="rounded-2xl border border-slate-200 bg-white p-4 text-left text-slate-900"><summary className="cursor-pointer text-sm font-bold focus-visible:outline-2 focus-visible:outline-orange-600">{t("labels.printSettings")}</summary>{fields}</details>;
}
