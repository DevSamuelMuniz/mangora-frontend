# Inventário de textos hardcoded (pt-BR)

Gerado por `node scripts/i18n-inventory.mjs`. Cada linha é uma ocorrência **candidata** — revisar manualmente antes de migrar.

| Módulo | Ocorrências candidatas |
|---|---|
| components | 8 |
| app | 5 |

**Total:** 13 candidatos em 2 módulo(s).

## Amostras

### app
- app\(dashboard)\clientes\page.tsx:17 — return <><CustomerCatalog />{(acao === "novo" || editing) && <WorkspaceModal closeHref="/clientes" label={edit
- app\(dashboard)\estoque\page.tsx:20 — return <><StockOverview />{acao === "movimentar" && <WorkspaceModal closeHref="/estoque" label={t("workspace.m
- app\(dashboard)\fornecedores\page.tsx:12 — export default async function SuppliersPage({ searchParams }: { searchParams: Promise<{ acao?: string; id?: st

### components
- components\bank\BankReconciliation.tsx:184 — const example = format === "ofx" ? "<OFX>...<STMTTRN><DTPOSTED>20260901</DTPOSTED><TRNAMT>-250.50</TRNAMT><FIT
- components\marketing\MarketSelector.tsx:19 — aria-label="País ou região de preços"
- components\pdv\ProductGrid.tsx:53 — aria-label={`Adicionar ${product.name}`}
