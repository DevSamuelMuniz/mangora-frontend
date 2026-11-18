import { jsPDF } from "jspdf";
import { barcodeData, barcodeFits, MAX_LABELS, validLabelSize, type LabelItem, type LabelPaper, type LabelSize } from "@/lib/labels";
import { PrintPageDrawing } from "./print-page";
import type { PdfOutput } from "./types";

export function buildLabelPdf(items: LabelItem[], size: LabelSize, paper: LabelPaper): PdfOutput {
  const total = items.reduce((sum, item) => sum + item.quantity, 0);
  if (!validLabelSize(size) || !items.length || total > MAX_LABELS || items.some(item => !Number.isInteger(item.quantity) || item.quantity < 1 || !barcodeFits(item.code, size.width))) throw new Error("invalid-label-job");
  const continuousRows = Math.floor(990 / size.height);
  const page = paper === "a4" ? { width: 210, height: 297 } : { width: size.width, height: paper === "continuous" ? Math.min(total, continuousRows) * size.height : size.height };
  const margin = paper === "a4" ? 5 : 0;
  const gap = paper === "a4" ? 2 : 0;
  const columns = paper === "a4" ? Math.floor((page.width - margin * 2 + gap) / (size.width + gap)) : 1;
  const rows = paper === "continuous" ? Math.min(total, continuousRows) : Math.floor((page.height - margin * 2 + gap) / (size.height + gap));
  if (columns < 1 || rows < 1) throw new Error("label-does-not-fit-paper");
  const pdf = new jsPDF({ unit: "mm", format: [page.width, page.height], orientation: page.width > page.height ? "landscape" : "portrait", compress: true });
  const pages: PdfOutput["pages"] = [];
  let drawing = new PrintPageDrawing(page.width, page.height);
  let index = 0;
  for (const item of items) for (let copy = 0; copy < item.quantity; copy++, index++) {
    const cell = index % (columns * rows);
    if (index && cell === 0) {
      const height = paper === "continuous" ? Math.min(total - index, continuousRows) * size.height : page.height;
      pages.push(drawing.page());
      drawing = new PrintPageDrawing(page.width, height);
      pdf.addPage([page.width, height], page.width > height ? "landscape" : "portrait");
    }
    const x = margin + (cell % columns) * (size.width + gap);
    const y = margin + Math.floor(cell / columns) * (size.height + gap);
    const available = size.width - 4;
    const compact = size.height < 30;
    const namePoints = compact ? 6.5 : 8;
    const lineHeight = namePoints * 25.4 / 72 * 1.1;
    const nameY = y + 1.5 + namePoints * 25.4 / 72;
    pdf.setFont("helvetica", "bold").setFontSize(namePoints);
    const lines: string[] = pdf.splitTextToSize(item.name, available);
    const name = lines.slice(0, size.height >= 30 ? 2 : 1);
    if (lines.length > name.length) {
      let last = name[name.length - 1];
      while (pdf.getTextWidth(`${last}...`) > available && last.length) last = last.slice(0, -1);
      name[name.length - 1] = `${last}...`;
    }
    pdf.text(name, x + size.width / 2, nameY, { align: "center", lineHeightFactor: 1.1 });
    name.forEach((line, index) => drawing.text(line, x + size.width / 2, nameY + index * lineHeight, namePoints, true, true));
    // Reserve fixed zones so wrapping a name never pushes the barcode off the label.
    const skuY = nameY + (compact ? 0 : lineHeight) + 2.5;
    const center = x + size.width / 2;
    function fitText(text: string, baseline: number, points: number, bold: boolean) {
      pdf.setFont("helvetica", bold ? "bold" : "normal").setFontSize(points);
      const fitted = Math.min(points, points * available / Math.max(pdf.getTextWidth(text), 0.01));
      pdf.setFontSize(fitted).text(text, center, baseline, { align: "center" });
      drawing.text(text, center, baseline, fitted, bold, true);
      return fitted;
    }
    fitText(item.productCode ?? item.code, skuY, compact ? 6 : 7, false);
    const priceY = y + size.height - 1.5;
    const pricePoints = fitText(item.price, priceY, compact ? 11 : 16, true);
    const codeY = priceY - pricePoints * 25.4 / 72 - 0.8;
    const data = barcodeData(item.code);
    const moduleWidth = Math.min(0.4, available / (data.length + 20));
    const barcodeWidth = (data.length + 20) * moduleWidth;
    const barY = skuY + 1;
    const digitsGap = 2.8;
    const barHeight = Math.min(12, codeY - digitsGap - barY);
    if (barHeight < 3) throw new Error("label-too-short");
    const startX = x + (size.width - barcodeWidth) / 2 + 10 * moduleWidth;
    pdf.setFillColor("#000000");
    for (let bit = 0; bit < data.length; bit++) {
      if (data[bit] !== "1") continue;
      const barX = startX + bit * moduleWidth;
      pdf.rect(barX, barY, moduleWidth, barHeight, "F");
      drawing.rect(barX, barY, moduleWidth, barHeight);
    }
    fitText(item.code, barY + barHeight + digitsGap, compact ? 5.5 : 6.5, false);
  }
  pages.push(drawing.page());
  return { pdf, ...page, pages, filename: `etiquetas-${Date.now()}.pdf` };
}
