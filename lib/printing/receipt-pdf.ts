import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import type { ReceiptLayout, ReceiptLine } from "./receipt";
import type { PdfOutput } from "./types";

export function renderReceiptPdf(layout: ReceiptLayout, width: 58 | 80, copies = 1): PdfOutput {
  const margin = width === 58 ? 5 : 4;
  type Line = ReceiptLine & { height: number };
  type Page = { lines: Line[]; height: number; qr?: ReturnType<typeof QRCode.create> };
  const measure = new jsPDF({ unit: "mm" });
  const pages: Page[] = [{ lines: [], height: 6 }];
  let page = pages[0];
  for (const line of layout.lines) {
    measure.setFont("helvetica", line.bold ? "bold" : "normal").setFontSize(line.size);
    const height = line.size * 0.352778 * 1.25;
    const available = width - margin * 2;
    const wrapped: string[] = line.separator
      ? ["-".repeat(Math.floor(available / measure.getTextWidth("-")))]
      : measure.splitTextToSize(line.text, available);
    for (const text of wrapped) {
      if (page.height + height > 990) {
        page = { lines: [], height: 6 };
        pages.push(page);
      }
      page.lines.push({ ...line, text, height });
      page.height += height;
    }
  }
  if (layout.qr) {
    if (page.height + 28 > 990) {
      page = { lines: [], height: 6 };
      pages.push(page);
    }
    page.height += 28;
    page.qr = QRCode.create(layout.qr, { errorCorrectionLevel: "M" });
  }

  function draw(pdf: jsPDF, page: Page) {
    let y = 3;
    for (const line of page.lines) {
      y += line.height;
      pdf.setFont("helvetica", line.bold ? "bold" : "normal").setFontSize(line.size);
      pdf.text(line.text, line.center ? width / 2 : margin, y - 1, { align: line.center ? "center" : "left" });
    }
    if (page.qr) {
      const { size, data } = page.qr.modules;
      const moduleSize = 24 / (size + 8);
      const x = (width - size * moduleSize) / 2;
      data.forEach((dark, index) => {
        if (dark) pdf.rect(x + index % size * moduleSize, y + 4 * moduleSize + Math.floor(index / size) * moduleSize, moduleSize, moduleSize, "F");
      });
    }
  }

  const height = Math.max(30, pages[0].height);
  const orientation = (height: number) => width > height ? "landscape" : "portrait";
  const newPdf = (height: number) => new jsPDF({ unit: "mm", format: [width, height], orientation: orientation(height), compress: true });
  const pdf = newPdf(height);
  for (let copy = 0; copy < copies; copy++) {
    pages.forEach((page, index) => {
      const pageHeight = Math.max(30, page.height);
      if (index || copy) pdf.addPage([width, pageHeight], orientation(pageHeight));
      draw(pdf, page);
    });
  }
  return { pdf, width, height, filename: layout.filename };
}
