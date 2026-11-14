import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import type { ReceiptLayout, ReceiptLine } from "./receipt";
import { PrintPageDrawing } from "./print-page";
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

  function draw(pdf: jsPDF, page: Page, drawing: PrintPageDrawing) {
    let y = 3;
    for (const line of page.lines) {
      y += line.height;
      pdf.setFont("helvetica", line.bold ? "bold" : "normal").setFontSize(line.size);
      const x = line.center ? width / 2 : margin;
      pdf.text(line.text, x, y - 1, { align: line.center ? "center" : "left" });
      drawing.text(line.text, x, y - 1, line.size, line.bold, line.center);
    }
    if (page.qr) {
      const { size, data } = page.qr.modules;
      const moduleSize = 24 / (size + 8);
      const x = (width - size * moduleSize) / 2;
      data.forEach((dark, index) => {
        if (!dark) return;
        const left = x + index % size * moduleSize;
        const top = y + (4 + Math.floor(index / size)) * moduleSize;
        pdf.rect(left, top, moduleSize, moduleSize, "F");
        drawing.rect(left, top, moduleSize, moduleSize);
      });
    }
  }

  const height = Math.max(30, pages[0].height);
  const orientation = (height: number) => width > height ? "landscape" : "portrait";
  const newPdf = (height: number) => new jsPDF({ unit: "mm", format: [width, height], orientation: orientation(height), compress: true });
  const pdf = newPdf(height);
  const printPages: PdfOutput["pages"] = [];
  for (let copy = 0; copy < copies; copy++) {
    pages.forEach((page, index) => {
      const pageHeight = Math.max(30, page.height);
      if (index || copy) pdf.addPage([width, pageHeight], orientation(pageHeight));
      const drawing = new PrintPageDrawing(width, pageHeight);
      draw(pdf, page, drawing);
      printPages.push(drawing.page());
    });
  }
  return { pdf, width, height, filename: layout.filename, pages: printPages };
}
