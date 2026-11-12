import type { jsPDF } from "jspdf";
import type { LabelItem, LabelPaper, LabelSize } from "@/lib/labels";
import type { Sale } from "@/types/sale";
import type { CompanySettings } from "@/types/settings";

export type PrintKind = "receipt" | "label";
export type PrintTransport = "browser" | "pixel" | "escpos";
export type ReceiptMode = "standard" | "bold" | "extra-bold";
export type ReceiptCompany = Pick<CompanySettings, "id" | "tradeName" | "document" | "phone" | "email" | "street" | "number" | "city" | "state" | "postalCode">;
export type ChangeInfo = { received: number; change: number };

export type PrintDocument =
  | { kind: "receipt"; sale: Sale; company: ReceiptCompany | null; change?: ChangeInfo; mode: ReceiptMode }
  | { kind: "label"; items: LabelItem[]; size: LabelSize; paper: LabelPaper }
  | { kind: "test"; target: PrintKind };

export type PrinterProfile = {
  transport: PrintTransport;
  name: string;
  width: 58 | 80;
  margin: number;
  model: "generic" | "knup-kp1025";
  copies: number;
  rasterize: boolean;
  encoding: "cp850" | "cp858";
  capabilities: { cut: boolean; qr: boolean };
  cut: boolean;
};

export type PdfPart = { pdf: jsPDF; width: number; height: number };
export type PdfOutput = PdfPart & { filename: string; parts?: PdfPart[] };
export type PrintOutput = { format: "pdf"; document: PdfOutput } | { format: "escpos"; bytes: Uint8Array; filename: string };

export type AdapterResult = "submitted" | "dialog-opened";
export type PrintResult = AdapterResult | "download-requested" | "skipped";
export type PrintState = PrintResult | "queued" | "preparing" | "sending" | "cancelled" | "failed" | "unknown";
export type PrintLog = {
  id: string;
  kind: PrintDocument["kind"];
  transport: PrintTransport;
  state: PrintState;
  updatedAt: number;
  reason?: PrintErrorCode;
};

export type PrintErrorCode = "connection" | "printer-missing" | "incompatible" | "cancelled" | "out-of-paper" | "unknown" | "browser" | "invalid";
export class PrintError extends Error {
  constructor(readonly code: PrintErrorCode, options?: ErrorOptions) {
    super(code, options);
    this.name = "PrintError";
  }
}

export interface PrinterAdapter {
  discover(): Promise<string[]>;
  connect(): Promise<void>;
  diagnose(profile: PrinterProfile): Promise<"available" | "unknown">;
  print(output: PrintOutput, profile: PrinterProfile): Promise<AdapterResult>;
}
