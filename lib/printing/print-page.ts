import type { PrintPage } from "./types";

function escapeXml(text: string) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export class PrintPageDrawing {
  private readonly elements: string[] = [];

  constructor(private readonly width: number, private readonly height: number) {}

  text(text: string, x: number, y: number, points: number, bold: boolean, centered = false) {
    this.elements.push(`<text x="${x}" y="${y}" font-size="${points * 25.4 / 72}" font-weight="${bold ? "bold" : "normal"}" text-anchor="${centered ? "middle" : "start"}">${escapeXml(text)}</text>`);
  }

  rect(x: number, y: number, width: number, height: number) {
    this.elements.push(`<rect x="${x}" y="${y}" width="${width}" height="${height}"/>`);
  }

  page(): PrintPage {
    const { width, height } = this;
    return { width, height, svg: `<svg width="${width}mm" height="${height}mm" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" font-family="Arial, sans-serif" fill="#000" xml:space="preserve">${this.elements.join("")}</svg>` };
  }
}
