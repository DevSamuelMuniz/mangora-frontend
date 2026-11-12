import type { PrintKind, PrinterProfile, PrintTransport } from "./types";

export type PrintPreferences = {
  printerProfile: "generic" | "knup-kp1025";
  transport: "browser" | "qz";
  labelPrinter: string;
  receiptPrinter: string;
  receiptWidth: 58 | 80;
  receiptProtocol: "pixel" | "escpos";
  receiptCopies: number;
  receiptEncoding: PrinterProfile["encoding"];
  receiptCutter: boolean;
  receiptCut: boolean;
  receiptQr: boolean;
  rasterize: boolean;
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
  receiptProtocol: "pixel", receiptCopies: 1, receiptEncoding: "cp850",
  receiptCutter: false, receiptCut: false, receiptQr: false, rasterize: false,
};

function storageKey(scope: string) {
  return scope ? `${KEY}.company.${encodeURIComponent(scope)}` : KEY;
}

export function readPrintPreferences(scope = ""): PrintPreferences {
  try {
    const stored = localStorage.getItem(storageKey(scope));
    // Legacy preferences are device-wide. Reuse paper and download defaults,
    // while requiring explicit selection of the direct destination per company.
    const legacy = scope && stored === null;
    const value = JSON.parse(stored ?? (legacy ? localStorage.getItem(KEY) : null) ?? "{}");
    const base = DEFAULT_PRINT_PREFERENCES;
    return {
      printerProfile: value.printerProfile === "knup-kp1025" ? "knup-kp1025" : "generic",
      transport: !legacy && value.transport === "qz" ? "qz" : "browser",
      labelPrinter: !legacy && typeof value.labelPrinter === "string" ? value.labelPrinter : "",
      receiptPrinter: !legacy && typeof value.receiptPrinter === "string" ? value.receiptPrinter : "",
      receiptWidth: value.printerProfile === "knup-kp1025" || value.receiptWidth === 58 ? 58 : 80,
      receiptProtocol: !legacy && value.receiptProtocol === "escpos" && value.printerProfile !== "knup-kp1025" ? "escpos" : "pixel",
      receiptCopies: Number.isInteger(value.receiptCopies) && value.receiptCopies >= 1 && value.receiptCopies <= 5 ? value.receiptCopies : 1,
      receiptEncoding: value.receiptEncoding === "cp858" ? "cp858" : "cp850",
      receiptCutter: !legacy && value.receiptCutter === true,
      receiptCut: !legacy && value.receiptCut === true && value.receiptCutter === true,
      receiptQr: !legacy && value.receiptQr === true,
      rasterize: value.rasterize === true,
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

export function printerProfile(preferences: PrintPreferences, kind: PrintKind, override?: PrintTransport): PrinterProfile {
  const receipt = kind === "receipt";
  const width = preferences.receiptWidth;
  return {
    transport: override ?? (preferences.transport === "browser" ? "browser" : receipt ? preferences.receiptProtocol : "pixel"),
    name: receipt ? preferences.receiptPrinter : preferences.labelPrinter,
    width,
    margin: width === 58 ? 5 : 4,
    model: preferences.printerProfile,
    copies: receipt ? preferences.receiptCopies : 1,
    rasterize: preferences.rasterize,
    encoding: preferences.receiptEncoding,
    capabilities: { cut: preferences.receiptCutter, qr: preferences.receiptQr },
    cut: preferences.receiptCut,
  };
}
