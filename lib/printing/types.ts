import type { jsPDF } from "jspdf";
import type { LabelItem, LabelPaper, LabelSize } from "@/lib/labels";
import type { Sale } from "@/types/sale";
import type { CompanySettings } from "@/types/settings";

export type PrintKind = "receipt" | "label";
export type ReceiptMode = "standard" | "bold" | "extra-bold";
export type ReceiptCompany = Pick<CompanySettings, "id" | "tradeName" | "document" | "phone" | "email" | "street" | "number" | "city" | "state" | "postalCode">;
export type ChangeInfo = { received: number; change: number };

export type PrintDocument =
  | { kind: "receipt"; sale: Sale; company: ReceiptCompany | null; change?: ChangeInfo; mode: ReceiptMode }
  | { kind: "label"; items: LabelItem[]; size: LabelSize; paper: LabelPaper }
  | { kind: "test"; target: PrintKind };

export type PrintPage = { width: number; height: number; svg: string };
export type PdfOutput = { pdf: jsPDF; width: number; height: number; filename: string; pages: PrintPage[] };

export type PrintResult = "dialog-opened" | "download-requested" | "skipped";
export type PrintState = PrintResult | "queued" | "preparing" | "sending" | "failed";
export type PrintLog = {
  id: string;
  kind: PrintDocument["kind"];
  state: PrintState;
  updatedAt: number;
  reason?: PrintErrorCode;
};

export type PrintErrorCode = "browser" | "invalid";
export class PrintError extends Error {
  constructor(readonly code: PrintErrorCode, options?: ErrorOptions) {
    super(code, options);
    this.name = "PrintError";
  }
}
