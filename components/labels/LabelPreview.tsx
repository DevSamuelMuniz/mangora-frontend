"use client";

import { useMemo } from "react";
import { barcodeFits, validLabelSize, type LabelItem, type LabelSize } from "@/lib/labels";
import { buildLabelPdf } from "@/lib/printing/label-pdf";

/** The preview, browser print and PDF share the same measured vector drawing. */
export default function LabelPreview({ item, size }: { item: LabelItem; size: LabelSize }) {
  const { name, productCode, code, price } = item;
  const { width, height } = size;
  const svg = useMemo(() => {
    if (!validLabelSize({ width, height }) || !barcodeFits(code, width)) return null;
    return buildLabelPdf([{ id: "preview", name, productCode, code, price, quantity: 1 }], { width, height }, "roll").pages[0].svg;
  }, [name, productCode, code, price, width, height]);

  if (!svg) return null;
  // All text in PrintPageDrawing is XML-escaped; no product HTML is interpolated.
  return <div role="img" aria-label={`${name}; ${productCode ?? code}; ${code}; ${price}`}
    className="mx-auto w-full max-w-full bg-white shadow-lg ring-1 ring-black/5 [&>svg]:block [&>svg]:h-auto [&>svg]:w-full"
    style={{ width: `${width}mm`, maxWidth: "100%", aspectRatio: `${width} / ${height}` }}
    dangerouslySetInnerHTML={{ __html: svg }} />;
}
