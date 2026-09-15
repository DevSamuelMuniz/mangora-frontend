# Inventário de textos hardcoded (pt-BR)

Gerado por `node scripts/i18n-inventory.mjs`. Cada linha é uma ocorrência **candidata** — revisar manualmente antes de migrar.

| Módulo | Ocorrências candidatas |
|---|---|
| components | 46 |
| app | 36 |

**Total:** 82 candidatos em 2 módulo(s).

## Amostras

### app
- app\(dashboard)\clientes\page.tsx:15 — return <><CustomerCatalog />{(acao === "novo" || editing) && <WorkspaceModal closeHref="/clientes" label={edit
- app\(dashboard)\dashboard\page.tsx:61 — title="Vendas realizadas"
- app\(dashboard)\dashboard\page.tsx:71 — title="Ticket médio"

### components
- components\bank\BankReconciliation.tsx:178 — const example = format === "ofx" ? "<OFX>...<STMTTRN><DTPOSTED>20260901</DTPOSTED><TRNAMT>-250.50</TRNAMT><FIT
- components\customers\CustomerCatalog.tsx:91 — <SummaryCard icon={Users} label="Total de clientes" value={String(customers.length)} iconClassName="bg-orange-
- components\customers\CustomerCatalog.tsx:92 — <SummaryCard icon={UserRoundCheck} label="Clientes ativos" value={String(activeCustomers)} iconClassName="bg-g
