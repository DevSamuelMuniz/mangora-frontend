import { jsPDF } from "jspdf";
import type { CompanySettings } from "@/types/settings";
import { paymentMethodLabels, type Sale } from "@/types/sale";
import { formatDateTime } from "@/lib/format";
import { readPrintPreferences } from "@/lib/printing/preferences";
import { submitPrintJob, type PrintJob } from "@/lib/printing/service";

type ReceiptCompany = Pick<CompanySettings, "tradeName" | "document" | "phone" | "email" | "street" | "number" | "city" | "state" | "postalCode">;
export type ReceiptMode = "standard" | "bold" | "extra-bold";
type ChangeInfo = { received: number; change: number };

export function buildReceiptPdf(sale: Sale, company: ReceiptCompany | null, changeInfo?: ChangeInfo, mode: ReceiptMode = "standard", width: 58 | 80 = 80): PrintJob {
  const measure = new jsPDF({ unit: "mm" });
  const fontSize = mode === "extra-bold" ? 11 : mode === "bold" ? 10 : 9;
  type Line = { text: string; size: number; bold: boolean; center: boolean; height: number };
  const lines: Line[] = [];
  const inset = width === 58 ? 5 : 4;
  function text(value: string, size = fontSize, bold = mode !== "standard", center = false) {
    measure.setFont("helvetica", bold ? "bold" : "normal").setFontSize(size);
    const wrapped: string[] = measure.splitTextToSize(value, width - inset * 2);
    for (const line of wrapped) lines.push({ text: line, size, bold, center, height: size * 0.352778 * 1.25 });
  }
  const money = (value: number) => Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const separator = () => text("-".repeat(width === 58 ? 29 : 43), 9, false);
  text(company?.tradeName || "Mangora", 13, true, true);
  if (company?.document) text(`CNPJ/CPF ${company.document}`, 8, false, true);
  const address = [company?.street, company?.number, company?.city, company?.state, company?.postalCode].filter(Boolean).join(", ");
  if (address) text(address, 8, false, true);
  const contact = [company?.phone, company?.email].filter(Boolean).join(" / ");
  if (contact) text(contact, 8, false, true);
  separator();
  text("CUPOM DE VENDA", 11, true, true);
  text(`Venda: ${sale.code}`);
  text(`Data: ${formatDateTime(sale.createdAt)}`);
  if (sale.createdByName) text(`Operador: ${sale.createdByName}`);
  text(`Cliente: ${sale.customerName}`);
  if (sale.customerDocument) text(`CPF/CNPJ: ${sale.customerDocument}`);
  text(`Pagamento: ${paymentMethodLabels[sale.paymentMethod]}`);
  separator();
  for (const item of sale.items) {
    text(item.productName);
    text(`${item.quantity} x ${money(item.unitPrice)} = ${money(item.subtotal)}`);
  }
  separator();
  text(`Subtotal: ${money(sale.subtotal)}`);
  if (Number(sale.discount) > 0) text(`Desconto: - ${money(sale.discount)}`);
  text(`TOTAL: ${money(sale.total)}`, 14, true);
  for (const payment of sale.payments ?? []) text(`${paymentMethodLabels[payment.method]}: ${money(payment.amount)}`);
  if (sale.paymentMethod === "CASH" && changeInfo) {
    text(`Valor recebido: ${money(changeInfo.received)}`);
    text(`Troco: ${money(changeInfo.change)}`, fontSize, true);
  }
  if (sale.notes) text(`Obs: ${sale.notes}`);
  separator();
  text("Obrigado pela preferência!", 9, true, true);
  text("Gerado por Mangora", 8, false, true);

  // Measure and paginate before allocating roll pages; no A4 height or blank tail.
  const pages: Line[][] = [[]];
  let used = 6;
  for (const line of lines) {
    if (used + line.height > 990) { pages.push([]); used = 6; }
    pages[pages.length - 1].push(line);
    used += line.height;
  }
  const heights = pages.map(page => Math.max(30, 6 + page.reduce((sum, line) => sum + line.height, 0)));
  const pdf = new jsPDF({ unit: "mm", format: [width, heights[0]], orientation: width > heights[0] ? "landscape" : "portrait", compress: true });
  const parts: NonNullable<PrintJob["parts"]> = [];
  pages.forEach((page, index) => {
    if (index) pdf.addPage([width, heights[index]], width > heights[index] ? "landscape" : "portrait");
    const part = new jsPDF({ unit: "mm", format: [width, heights[index]], orientation: width > heights[index] ? "landscape" : "portrait", compress: true });
    let y = 3;
    for (const line of page) {
      pdf.setFont("helvetica", line.bold ? "bold" : "normal").setFontSize(line.size);
      y += line.height;
      pdf.text(line.text, line.center ? width / 2 : inset, y - 1, { align: line.center ? "center" : "left" });
      part.setFont("helvetica", line.bold ? "bold" : "normal").setFontSize(line.size);
      part.text(line.text, line.center ? width / 2 : inset, y - 1, { align: line.center ? "center" : "left" });
    }
    parts.push({ pdf: part, width, height: heights[index] });
  });
  return { pdf, width, height: heights[0], kind: "receipt", parts, filename: `cupom-${sale.code.replace(/[^\w-]/g, "_")}.pdf` };
}

export async function printReceipt(sale: Sale, company: ReceiptCompany | null, changeInfo?: ChangeInfo, mode: ReceiptMode = "standard") {
  return submitPrintJob(buildReceiptPdf(sale, company, changeInfo, mode, readPrintPreferences().receiptWidth));
}

const automaticAttempts = new Set<string>();
export function claimAutomaticReceipt(saleId: string) {
  if (automaticAttempts.has(saleId)) return false;
  const key = `mangora.print-attempt.${saleId}`;
  try {
    if (sessionStorage.getItem(key)) return false;
    sessionStorage.setItem(key, "1");
  } catch { /* In-memory protection remains when storage is blocked. */ }
  automaticAttempts.add(saleId);
  return true;
}
