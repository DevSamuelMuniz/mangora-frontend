import { jsPDF } from "jspdf";
import { barcodeData, barcodeFits, MAX_LABELS, validLabelSize, type LabelItem, type LabelPaper, type LabelSize } from "@/lib/labels";
import type { PrintJob } from "./service";

export function buildLabelPdf(items: LabelItem[], size: LabelSize, paper: LabelPaper, profile: "generic" | "knup-kp1025" = "generic"): PrintJob {
  const total = items.reduce((sum, item) => sum + item.quantity, 0);
  const knup = profile === "knup-kp1025";
  if (knup && (paper === "a4" || size.width > 48)) throw new Error("knup-printable-width-exceeded");
  if (!validLabelSize(size) || !items.length || total > MAX_LABELS || items.some(item => !Number.isInteger(item.quantity) || item.quantity < 1 || !barcodeFits(item.code, size.width))) throw new Error("invalid-label-job");
  const continuousRows = Math.floor(990 / size.height);
  const mediaWidth = knup ? 58 : size.width;
  const page = paper === "a4" ? { width: 210, height: 297 } : { width: mediaWidth, height: paper === "continuous" ? Math.min(total, continuousRows) * size.height : size.height };
  const margin = paper === "a4" ? 5 : 0;
  const gap = paper === "a4" ? 2 : 0;
  const columns = paper === "a4" ? Math.floor((page.width - margin * 2 + gap) / (size.width + gap)) : 1;
  const rows = paper === "continuous" ? Math.min(total, continuousRows) : Math.floor((page.height - margin * 2 + gap) / (size.height + gap));
  if (columns < 1 || rows < 1) throw new Error("label-does-not-fit-paper");
  const pdf = new jsPDF({ unit: "mm", format: [page.width, page.height], orientation: page.width > page.height ? "landscape" : "portrait", compress: true });
  const parts: NonNullable<PrintJob["parts"]> = [];
  let part = new jsPDF({ unit: "mm", format: [page.width, page.height], orientation: page.width > page.height ? "landscape" : "portrait", compress: true });
  if (paper === "continuous") parts.push({ pdf: part, ...page });
  let index = 0;
  for (const item of items) for (let copy = 0; copy < item.quantity; copy++, index++) {
    const cell = index % (columns * rows);
    if (index && cell === 0) {
      const height = paper === "continuous" ? Math.min(total - index, continuousRows) * size.height : page.height;
      pdf.addPage([page.width, height], page.width > height ? "landscape" : "portrait");
      if (paper === "continuous") {
        part = new jsPDF({ unit: "mm", format: [page.width, height], orientation: page.width > height ? "landscape" : "portrait", compress: true });
        parts.push({ pdf: part, width: page.width, height });
      }
    }
    const x = (knup ? (58 - size.width) / 2 : margin) + (cell % columns) * (size.width + gap);
    const y = margin + Math.floor(cell / columns) * (size.height + gap);
    for (const target of paper === "continuous" ? [pdf, part] : [pdf]) {
      const available = size.width - 4;
      target.setFont("helvetica", "bold").setFontSize(9);
      const lines: string[] = target.splitTextToSize(item.name, available);
      const name = lines.slice(0, size.height >= 30 ? 2 : 1);
      if (lines.length > name.length) {
        let last = name[name.length - 1];
        while (target.getTextWidth(`${last}...`) > available && last.length) last = last.slice(0, -1);
        name[name.length - 1] = `${last}...`;
      }
      target.text(name, x + size.width / 2, y + 4.5, { align: "center", lineHeightFactor: 1.1 });
      const priceY = y + 4.5 + name.length * 3.5;
      target.setFontSize(10).text(item.price, x + size.width / 2, priceY, { align: "center", maxWidth: available });
      const data = barcodeData(item.code);
      const moduleWidth = Math.min(0.4, available / (data.length + 20));
      const barcodeWidth = (data.length + 20) * moduleWidth;
      const barY = priceY + 1.5;
      const barHeight = Math.min(12, y + size.height - 5 - barY);
      if (barHeight < 3) throw new Error("label-too-short");
      const startX = x + (size.width - barcodeWidth) / 2 + 10 * moduleWidth;
      target.setFillColor("#000000");
      for (let bit = 0; bit < data.length; bit++) if (data[bit] === "1") target.rect(startX + bit * moduleWidth, barY, moduleWidth, barHeight, "F");
      target.setFont("helvetica", "normal").setFontSize(7).text(item.code, x + size.width / 2, barY + barHeight + 3, { align: "center" });
    }
  }
  return { pdf, ...page, ...(parts.length ? { parts } : {}), kind: "label", filename: `etiquetas-${Date.now()}.pdf` };
}
