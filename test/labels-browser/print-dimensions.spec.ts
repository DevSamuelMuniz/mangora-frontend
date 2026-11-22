import { expect, test } from "@playwright/test";
import { buildBrowserPrintHtml } from "../../lib/printing/browser-print-adapter";
import { buildLabelPdf } from "../../lib/printing/label-pdf";
import { receiptTestLayout } from "../../lib/printing/receipt";
import { renderReceiptPdf } from "../../lib/printing/receipt-pdf";

const item = { id: "blouse", name: "Blusa de Tule CAOS", productCode: "600461", code: "2028813", price: "R$ 599,90", quantity: 1 };
const jobs = [
  { name: "square-label", output: () => buildLabelPdf([item], { width: 40, height: 40 }, "continuous") },
  { name: "landscape-labels", output: () => buildLabelPdf([{ ...item, quantity: 2 }], { width: 60, height: 40 }, "roll") },
  { name: "continuous-final-strip", output: () => buildLabelPdf([{ ...item, quantity: 25 }], { width: 40, height: 40 }, "continuous") },
  { name: "a4-labels", output: () => buildLabelPdf([item], { width: 40, height: 40 }, "a4") },
  ...([58, 80] as const).map(width => ({ name: `receipt-${width}`, output: () => renderReceiptPdf(receiptTestLayout(width), width, 2) })),
];

for (const job of jobs) test(`prints actual paper dimensions: ${job.name}`, async ({ page }, testInfo) => {
  const output = job.output();
  await page.setContent(buildBrowserPrintHtml(output.pages));
  await page.emulateMedia({ media: "print" });
  const sections = page.locator("section");
  await expect(sections).toHaveCount(output.pages.length);
  for (const [index, expected] of output.pages.entries()) {
    const size = await sections.nth(index).evaluate(section => {
      const box = section.getBoundingClientRect();
      const svg = section.querySelector("svg")!.getBoundingClientRect();
      return { width: box.width, height: box.height, svgWidth: svg.width, svgHeight: svg.height };
    });
    const pixelsPerMm = 96 / 25.4;
    expect(size.width).toBeCloseTo(expected.width * pixelsPerMm, 1);
    expect(size.height).toBeCloseTo(expected.height * pixelsPerMm, 1);
    expect(size.svgWidth).toBeCloseTo(size.width, 1);
    expect(size.svgHeight).toBeCloseTo(size.height, 1);
  }
  await sections.first().screenshot({ path: testInfo.outputPath(`${job.name}.png`) });
  const pdf = await page.pdf({ path: testInfo.outputPath(`${job.name}.pdf`), preferCSSPageSize: true });
  const boxes = [...pdf.toString("latin1").matchAll(/\/MediaBox\s*\[\s*0\s+0\s+([\d.]+)\s+([\d.]+)\s*\]/g)];
  expect(boxes).toHaveLength(output.pages.length);
  boxes.forEach((box, index) => {
    const expected = output.pages[index];
    // Chromium rounds physical paper dimensions to device units.
    expect(Math.abs(Number(box[1]) * 25.4 / 72 - expected.width)).toBeLessThan(0.5);
    expect(Math.abs(Number(box[2]) * 25.4 / 72 - expected.height)).toBeLessThan(0.5);
  });
});
