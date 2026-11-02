---
version: alpha
name: Mangora
description: Gestão de varejo com controles de balcão e identidade verde e laranja.
colors:
  primary: "#f97316"
  foreground: "#173d2b"
  background: "#e9dfd2"
  secondary: "#f59e0b"
  accent: "#16803c"
typography:
  sans:
    fontFamily: "Geist, Arial, sans-serif"
  display:
    fontFamily: "Bricolage Grotesque, Arial, sans-serif"
  mono:
    fontFamily: "Geist Mono, monospace"
rounded:
  control: "0.75rem"
  panel: "1rem"
spacing:
  control-height: "2.75rem"
  panel-padding: "1rem"
components:
  print-settings: {}
  label-preview: {}
---

# Mangora

## Overview

Product interface for retail operators. The physical reference is the shop counter:
clear prices, readable codes and fast repeatable actions. Preserve the existing
orange actions, green ink and receipt preview. Printing settings extend the current
interface without introducing a new visual identity.

Brazilian retail is evidenced by the existing BRL receipts and CPF/CNPJ fields.
The application also supports pt-PT, en-US and es-ES; new owned copy follows the
active catalogue. No Japan-specific workflow is introduced.

## Colors

Runtime ownership remains in `app/globals.css`; this document mirrors its tokens.
`colors.primary` maps to `--brand-primary`, foreground to `--foreground`, background
to `--background`, secondary to `--brand-secondary`, accent to `--brand-accent`.
Tailwind's existing slate/white label panels remain the neutral workspace palette.
PDV content uses `pdv-*` semantic tokens and the existing dark/green themes.

## Typography

Geist handles controls, Bricolage Grotesque handles display titles, Geist Mono
handles compact operational metadata. These map to the Next font variables in
`app/layout.tsx` and Tailwind's font adapter in `app/globals.css`.
Printed PDFs use embedded PDF core Helvetica for Portuguese, Spanish and Latin
content, with explicit point sizes independent of screen scaling. Broader Unicode
font coverage requires a future embedded font; do not claim arbitrary script support.

## Layout

The label workspace retains its max-w-7xl two-column desktop layout, stacking at
narrow widths. Controls are 44px tall; cards use 16px padding and 16px radii.
Settings use native details/summary, retaining keyboard behavior and normal document
scroll. Status regions reserve space. Native select popups are intentionally owned
by the operating system.

## Elevation & Depth

Borders define workspace panels; the paper preview alone carries a small shadow.
Do not add ornamental gradients, new floating tools or dashboard metrics to printing.

## Shapes

Rounded-xl controls and rounded-2xl panels follow existing label-workspace geometry.
Printed paper uses rectangular pages with no decorative frame.

## Components

`components/printing/PrintSettings.tsx` owns printer selection, connection feedback,
automatic receipt and PDF-download controls for both flows. `lib/printing` owns
preferences, local transport and physical sizing. Use native labeled fields,
visible focus, busy/disabled states, inline errors and polite status regions.
Lucide icons remain the existing icon family. Loading animation communicates work;
new settings add no decorative animation. Product copy names concrete actions and
distinguishes a submitted job from physically printed paper.

Printer models are selected through the same native settings fields. The KP-1025
profile distinguishes physical paper (58 mm) from printable width (48 mm); show
both in help text rather than silently scaling output to fit.

## Do's and Don'ts

- Reuse PrintSettings across labels and receipts.
- Preserve physical millimetres and show the selected paper mode.
- Keep operational controls familiar; avoid a visual rebrand during infrastructure work.
- Do not report physical print success from a resolved spooler submission.
