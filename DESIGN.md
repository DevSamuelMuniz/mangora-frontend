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
Global scrollbars inherit the slate palette from `--scrollbar-thumb`, `--scrollbar-track`,
`--scrollbar-hover` and `--scrollbar-active` in `app/globals.css`, with system colors
in forced-colors mode. No per-panel opt-in is required.
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

At PDV sale completion, print settings occupy a separate 320px column to the
right of the sale summary from the md breakpoint; on smaller screens the two
panels stack in document order. Expanding settings does not stretch the summary.

Manual printing uses the shared native PrintDialog. Document summary or label
preview occupies the left column; editable document settings use
the same 320px right column. A sticky confirmation footer stays reachable while
the dialog scrolls. Narrow screens stack the two columns. Use existing slate
panels, orange primary actions and white paper previews. Printer selection belongs to the browser print dialog.

## Elevation & Depth

Borders define workspace panels; the paper preview alone carries a small shadow.
Do not add ornamental gradients, new floating tools or dashboard metrics to printing.

## Shapes

Rounded-xl controls and rounded-2xl panels follow existing label-workspace geometry.
Printed paper uses rectangular pages with no decorative frame.

Labels use a single measured vector drawing in LabelPreview, browser printing
and PDF export. The product name anchors the top, followed by the SKU; the barcode
and its readable digits occupy the middle, and a bold price anchors the bottom.
Fixed physical zones prevent a long name from displacing the barcode. Compact
20mm labels use a smaller type scale and one name line. Preview paper scales down
to its container on mobile; printed dimensions remain in millimetres.

## Components

`components/printing/PrintSettings.tsx` owns receipt format, test page, automatic receipt dialog and PDF-download controls. `lib/printing` owns
preferences, local transport and physical sizing. Use native labeled fields,
visible focus, busy/disabled states, inline errors and polite status regions.
Lucide icons remain the existing icon family. Loading animation communicates work;
new settings add no decorative animation. Product copy names concrete actions and
reports when the print dialog was requested.

## Do's and Don'ts

- Reuse PrintSettings across labels and receipts.
- Preserve physical millimetres and show the selected paper mode.
- Keep operational controls familiar; avoid a visual rebrand during infrastructure work.
- Do not report physical print success from a resolved spooler submission.

## Public knowledge guides

The /guias content section extends the cream/green/orange marketing identity and existing BrandLogo. Bricolage headlines, a ruled subject index and a left chapter rail prioritize reading over dashboard cards. The rail stacks above the article on narrow screens. Guides currently have only a pt-BR edition, explicitly labeled, with canonical redirects from locale-prefixed duplicates. Content is server rendered; FAQ answers remain visible without JavaScript, with native anchors and a skip link. No new application controls or tokens are introduced.

## Assinatura e pagamentos

As superfícies de cobrança são produto administrativo. Preservam o verde #173d2b,
laranja de ação e painéis brancos/slate existentes; a assinatura tem um painel
verde para o contrato atual e um painel adjacente para acesso e vencimento. Os
limites e preços vêm do catálogo regional da API, sem duplicar promessas de plano.
A página separada de cobranças é uma lista paginada com totais por moeda, filtros
e ações de 44px. Em telas estreitas, linhas e barras de ações empilham em ordem.

`components/ui/ModalDialog.tsx` usa dialog nativo no top layer, com título,
foco contido, restauração do foco, Escape, scroll interno e fechamento desabilitado
durante gravação. É o proprietário dos novos diálogos de cobrança e dos editores
administrativos migrados. Ícones Lucide continuam sem nova biblioteca visual.
Selects e datas usam controles nativos com popup e teclado do sistema operacional.
Não introduzir cores ou fontes novas para estados de pagamento.

## Exclusão de produtos

O catálogo mantém os painéis brancos/slate e as ações laranja existentes.
Excluir aparece diretamente na lista e nos cards, com ícone, texto e vermelho
semântico. A confirmação usa `components/ui/ModalDialog.tsx`, preserva o nome
do produto, bloqueia ações durante a gravação e apresenta falhas dentro do diálogo.

## Senha de operação

Configurações → Segurança contém `OperationPinSettings`, com o mesmo painel
branco/slate, ações laranja e campos de 44px. O proprietário confirma um código
de e-mail antes de criar ou trocar a senha de seis números da empresa.
`OperationPasswordProvider` mantém um único barramento para as solicitações da
API; `OperationPasswordModal` usa o `ModalDialog` compartilhado, inclusive quando
aparece sobre uma confirmação de exclusão. Senhas ficam ocultas por padrão e
podem ser reveladas explicitamente. O campo usa teclado numérico sem perder
zeros à esquerda. Mensagens próprias seguem o catálogo do idioma ativo.
