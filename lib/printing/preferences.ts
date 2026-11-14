export type PrintPreferences = {
  receiptWidth: 58 | 80;
  receiptCopies: number;
  autoReceipt: boolean;
  savePdf: boolean;
  labelWidth: number;
  labelHeight: number;
  labelPaper: "continuous" | "roll" | "a4";
};

const KEY = "mangora.printing.v1";
export const DEFAULT_PRINT_PREFERENCES: PrintPreferences = {
  receiptWidth: 80, receiptCopies: 1,
  autoReceipt: true, savePdf: true, labelWidth: 50, labelHeight: 30, labelPaper: "continuous",
};

function storageKey(scope: string) {
  return scope ? `${KEY}.company.${encodeURIComponent(scope)}` : KEY;
}

export function readPrintPreferences(scope = ""): PrintPreferences {
  try {
    const stored = localStorage.getItem(storageKey(scope));
    const value = JSON.parse(stored ?? (scope ? localStorage.getItem(KEY) : null) ?? "{}");
    // Restore document preferences only. Device, driver and transport fields are obsolete.
    const base = DEFAULT_PRINT_PREFERENCES;
    return {
      receiptWidth: value.receiptWidth === 58 ? 58 : base.receiptWidth,
      receiptCopies: Number.isInteger(value.receiptCopies) && value.receiptCopies >= 1 && value.receiptCopies <= 5 ? value.receiptCopies : base.receiptCopies,
      autoReceipt: typeof value.autoReceipt === "boolean" ? value.autoReceipt : base.autoReceipt,
      savePdf: typeof value.savePdf === "boolean" ? value.savePdf : base.savePdf,
      labelWidth: Number.isFinite(value.labelWidth) && value.labelWidth >= 30 && value.labelWidth <= 200 ? value.labelWidth : base.labelWidth,
      labelHeight: Number.isFinite(value.labelHeight) && value.labelHeight >= 20 && value.labelHeight <= 200 ? value.labelHeight : base.labelHeight,
      labelPaper: value.labelPaper === "a4" || value.labelPaper === "roll" ? value.labelPaper : "continuous",
    };
  } catch { return { ...DEFAULT_PRINT_PREFERENCES }; }
}

export function savePrintPreferences(patch: Partial<PrintPreferences>, scope = "") {
  const next = { ...readPrintPreferences(scope), ...patch };
  localStorage.setItem(storageKey(scope), JSON.stringify(next));
  window.dispatchEvent(new Event("mangora-print-preferences"));
  return next;
}
