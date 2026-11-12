import type { PrintConfig, PrintData } from "qz-tray";
import { PrintError, type PdfOutput, type PrinterProfile } from "./types";

export class SystemPrinterAdapter {
  async print(
    document: PdfOutput,
    profile: PrinterProfile,
    send: (options: PrintConfig, data: PrintData[]) => Promise<void>,
  ) {
    const parts = document.parts ?? [document];
    const pages = parts.map(part => ({
      options: {
        units: "mm", size: { width: part.width, height: part.height }, margins: 0,
        scaleContent: false, rasterize: profile.rasterize, copies: parts.length === 1 ? profile.copies : 1,
        orientation: part.width > part.height ? "landscape" : "portrait", jobName: document.filename,
      } satisfies PrintConfig,
      data: [{ type: "pixel", format: "pdf", flavor: "base64", data: part.pdf.output("datauristring").split(",")[1] }] satisfies PrintData[],
    }));
    let sent = 0;
    try {
      for (let copy = 0; copy < (parts.length === 1 ? 1 : profile.copies); copy++) {
        for (const page of pages) {
          await send(page.options, page.data);
          sent++;
        }
      }
    } catch (cause) {
      // A prior page/copy may already be in the spooler.
      if (sent) throw new PrintError("unknown", { cause });
      throw cause;
    }
  }
}
