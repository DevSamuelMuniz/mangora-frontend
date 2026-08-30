# Arquitetura do Frontend — Gestão+ (Mangora)

Documento de referência das relações entre módulos (Fase 7 do plano de
refatoração). O backend (NestJS + Prisma) é a autoridade de dados e regras;
o frontend (Next.js App Router) é apenas interface sobre essa camada.

## Camadas

```
app/            → rotas FINAS: server components buscam dados e delegam UI
features/*      → hooks de domínio (estado de servidor + invalidação)
components/     → UI (catálogos/forms consomem hooks; shared/ tem primitivas)
lib/            → format (fonte única de formatação), api (client + config),
                  permissions (can), plans (catálogo de marketing), auth
```

## Estado de servidor (TanStack Query)

- `lib/api/client.ts` — `apiRequest` (fetch via BFF `/api/backend`, cookie session)
- `lib/api/server-client.ts` — `serverApiRequest` (server components)
- `lib/hooks/useApiQuery.ts` — hooks base `useApiQuery` / `useApiMutation`
- Cada domínio tem `features/<domínio>/hooks/use<Entidade>.ts` com:
  - `use<Entidade>()` (query) e `use<Ação>()` (mutation)
  - `onSuccess` → `invalidateQueries` das chaves afetadas

## Chaves de query (invalidação cruzada)

| Domínio | Chave |
|---|---|
| vendas | `["sales"]` |
| clientes | `["customers"]` |
| produtos | `["products"]` |
| estoque | `["stock"]` |
| financeiro | `["financial"]` |
| pedidos | `["orders"]` |
| compras | `["purchases"]` |
| serviços | `["services"]` |
| fornecedores | `["suppliers"]` |
| categorias | `["categories"]` |
| unidades | `["unit-group"]`, `["analytics-consolidated", period]` |
| assinatura | `["subscription"]` |
| funcionários | `["employees"]` |
| notificações | `["notifications"]` |
| fiscal | `["fiscal-overview"]`, `["fiscal-settings"]` |
| caixa | `["cash-register"]` |
| configurações | `["company-settings"]`, `["security-overview"]` |
| relatórios | `["analytics-reports", period]` |
| dashboard | `["analytics"]` (invalidada por mutações que mudam métricas) |

## Efeitos entre módulos (uma ação → várias telas)

```
Criar venda (useCreateSale)
  → invalida: sales, products, stock, customers, financial, analytics

Cancelar venda (useCancelSale)
  → invalida: sales

Criar pedido (useCreateOrder)            [reserva estoque]
  → invalida: orders, stock

Converter pedido (useConvertOrder)       [gera venda]
  → invalida: orders, sales, stock, financial, analytics

Cancelar pedido (useCancelOrder)         [libera reserva]
  → invalida: orders, stock

Salvar produto (useSaveProduct)
  → invalida: products, stock

Registrar movimentação/transferência de estoque
  → invalida: stock

Registrar pagamento financeiro (usePayFinancialEntry)
  → invalida: financial

Receber/cancelar compra (usePurchaseAction)
  → invalida: purchases (e efeitos de estoque/financeiro no backend)
```

## Mapa de domínios → telas

```
Auth            → login, cadastro, recuperar/redefinir senha, layout (dashboard)
Workspace/Units → unidades (grupo + consolidado), sidebar, dashboard header
Customers       → clientes (catálogo + forms), seletores em vendas/pedidos
Products        → produtos (catálogo + form), loja pública, estoque
Inventory       → estoque (visão + movimentação + transferência)
Sales           → vendas (catálogo + PDV), dashboard, relatórios
Orders          → pedidos (catálogo + form), conversão em venda
Cash Register   → caixa (painel), vendas em dinheiro
Financial       → financeiro (overview + lançamento), vendas (contas a receber)
Fiscal          → central de notas, configuração fiscal (NF-e/NFC-e, Focus NFe)
Reports         → relatórios (por período), dashboard
Notifications   → header (sino), jobs (resumos/alertas)
Settings        → configurações (empresa/segurança), permissões (can)
Subscription    → assinatura (planos + Asaas), landing page (lib/plans)
Public Store    → loja pública (catálogo + pedido)
```

## Permissões (UX)

`lib/permissions.ts` — `can(role, permission)`. Matriz única:
`company:configure` = OWNER|ADMIN · `subscription:manage` = OWNER ·
`employees:manage` = OWNER|ADMIN. O backend permanece a autoridade.

## Testes

`npm test` (Vitest) — suítes unitárias em `lib/*.test.ts`:
format (formatação pt-BR), permissions (matriz can), plans (catálogo).

## Pendências conhecidas

- Testes de fluxo (hooks com fetch mockado) — cobertura em `features/sales|customers|stock|orders/hooks` e `lib/api/config`; expandir para os demais domínios quando necessário.
- Fail-fast do `API_BASE_URL` — implementado em `lib/api/config.ts` (lança erro em produção sem a env var; ignorado durante `next build` via `NEXT_PHASE`, pois o prerender não chama a API de verdade).
- Planos — catálogo canônico único em `lib/plans.ts`: o painel usa `subscriptionPlans` (4 planos/Asaas) e a landing usa a visão derivada `marketingPlans` (3 planos, preço de exibição).
