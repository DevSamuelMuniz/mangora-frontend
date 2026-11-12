import { formatCurrency, formatDateTime } from "@/lib/format";
import { paymentMethodLabels } from "@/types/sale";
import type { PrintDocument } from "./types";

export type ReceiptLine = {
  text: string;
  size: number;
  bold: boolean;
  center: boolean;
  separator?: boolean;
};

export type ReceiptLayout = { lines: ReceiptLine[]; filename: string; qr?: string };

export function cleanPrintText(value: string) {
  return value.normalize("NFC").replace(/[\p{Cc}\p{Cf}\u2028\u2029]/gu, " ").trim();
}

export function receiptLayout({ sale, company, change, mode }: Extract<PrintDocument, { kind: "receipt" }>): ReceiptLayout {
  const fontSize = mode === "extra-bold" ? 11 : mode === "bold" ? 10 : 9;
  const lines: ReceiptLine[] = [];
  function text(value: string, size = fontSize, bold = mode !== "standard", center = false) {
    lines.push({ text: cleanPrintText(value), size, bold, center });
  }
  const money = (value: number) => formatCurrency(Number(value));
  const separator = () => lines.push({ text: "", size: 9, bold: false, center: false, separator: true });
  text(company?.tradeName || "Mangora", 13, true, true);
  if (company?.document) text(`CNPJ/CPF ${company.document}`, 8, false, true);
  const address = [company?.street, company?.number, company?.city, company?.state, company?.postalCode].filter(Boolean).join(", ");
  if (address) text(address, 8, false, true);
  const contact = [company?.phone, company?.email].filter(Boolean).join(" / ");
  if (contact) text(contact, 8, false, true);
  separator();
  text("COMPROVANTE DE VENDA", 11, true, true);
  text("DOCUMENTO NÃO FISCAL", 9, true, true);
  text(`Venda: ${sale.code}`);
  text(`Data: ${formatDateTime(sale.createdAt)}`);
  if (sale.createdByName) text(`Operador: ${sale.createdByName}`);
  text(`Cliente: ${sale.customerName}`);
  if (sale.customerDocument) text(`CPF/CNPJ: ${sale.customerDocument}`);
  text(`Pagamento: ${paymentMethodLabels[sale.paymentMethod]}`);
  separator();
  for (const item of sale.items) {
    text(item.productName);
    text(`${item.quantity} × ${money(item.unitPrice)} = ${money(item.subtotal)}`);
  }
  separator();
  text(`Subtotal: ${money(sale.subtotal)}`);
  if (Number(sale.discount) > 0) text(`Desconto: -${money(sale.discount)}`);
  text(`TOTAL: ${money(sale.total)}`, 14, true);
  for (const payment of sale.payments ?? []) text(`${paymentMethodLabels[payment.method]}: ${money(payment.amount)}`);
  if (sale.paymentMethod === "CASH" && change) {
    text(`Valor recebido: ${money(change.received)}`);
    text(`Troco: ${money(change.change)}`, fontSize, true);
  }
  if (sale.notes) text(`Obs: ${sale.notes}`);
  separator();
  text("Obrigado pela preferência!", 9, true, true);
  text("Gerado por Mangora", 8, false, true);
  return { lines, filename: `cupom-${sale.code.replace(/[^\w-]/g, "_")}.pdf` };
}

export function receiptTestLayout(width: 58 | 80): ReceiptLayout {
  return {
    filename: "teste-de-impressao.pdf",
    lines: [
      { text: "TESTE DE IMPRESSÃO", size: 12, bold: true, center: true },
      { text: "DOCUMENTO NÃO FISCAL", size: 9, bold: true, center: true },
      { text: `Bobina de ${width} mm`, size: 9, bold: false, center: true },
      { text: "", size: 9, bold: false, center: false, separator: true },
      { text: "Acentos: ação, café, maçã, pão.", size: 9, bold: false, center: false },
      { text: "2 × R$ 10,00 = R$ 20,00", size: 9, bold: false, center: false },
      { text: "Desconto: -R$ 2,00", size: 9, bold: false, center: false },
      { text: "TOTAL: R$ 18,00", size: 14, bold: true, center: false },
    ],
    qr: "MANGORA TESTE DE IMPRESSAO",
  };
}
