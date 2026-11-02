export type PrintPreferences = {
  printerProfile: "generic" | "knup-kp1025";
  transport: "browser" | "qz";
  labelPrinter: string;
  receiptPrinter: string;
  receiptWidth: 58 | 80;
  autoReceipt: boolean;
  savePdf: boolean;
  labelWidth: number;
  labelHeight: number;
  labelPaper: "continuous" | "roll" | "a4";
};

const KEY = "mangora.printing.v1";
export const DEFAULT_PRINT_PREFERENCES: PrintPreferences = {
  printerProfile: "generic",
  transport: "browser", labelPrinter: "", receiptPrinter: "", receiptWidth: 80,
  autoReceipt: true, savePdf: true, labelWidth: 50, labelHeight: 30, labelPaper: "continuous",
};

export function readPrintPreferences(): PrintPreferences {
  try {
    const value = JSON.parse(localStorage.getItem(KEY) || "{}");
    const base = DEFAULT_PRINT_PREFERENCES;
    return {
      printerProfile: value.printerProfile === "knup-kp1025" ? "knup-kp1025" : "generic",
      transport: value.transport === "qz" ? "qz" : "browser",
      labelPrinter: typeof value.labelPrinter === "string" ? value.labelPrinter : "",
      receiptPrinter: typeof value.receiptPrinter === "string" ? value.receiptPrinter : "",
      receiptWidth: value.printerProfile === "knup-kp1025" || value.receiptWidth === 58 ? 58 : 80,
      autoReceipt: typeof value.autoReceipt === "boolean" ? value.autoReceipt : base.autoReceipt,
      savePdf: typeof value.savePdf === "boolean" ? value.savePdf : base.savePdf,
      labelWidth: Number.isFinite(value.labelWidth) && value.labelWidth >= 30 && value.labelWidth <= 200 ? value.labelWidth : base.labelWidth,
      labelHeight: Number.isFinite(value.labelHeight) && value.labelHeight >= 20 && value.labelHeight <= 200 ? value.labelHeight : base.labelHeight,
      labelPaper: value.labelPaper === "a4" || value.labelPaper === "roll" ? value.labelPaper : "continuous",
    };
  } catch { return { ...DEFAULT_PRINT_PREFERENCES }; }
}

export function savePrintPreferences(patch: Partial<PrintPreferences>) {
  const next = { ...readPrintPreferences(), ...patch };
  localStorage.setItem(KEY, JSON.stringify(next));
  window.dispatchEvent(new Event("mangora-print-preferences"));
  return next;
}
