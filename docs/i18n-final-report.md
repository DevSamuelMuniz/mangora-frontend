# Relatório final de internacionalização (i18n) — Mangora

Documento de encerramento do briefing de i18n (ponto 87). Cada item traz o que foi decidido, onde está no código e como foi verificado.

Data: 16 de setembro de 2026 · Repositórios: `frontend` (Next 16 / React 19) e `backend` (NestJS + Prisma)

---

## 1. Idiomas suportados e padrão

| Locale | Papel | Prefixo público de URL | Fallback |
|---|---|---|---|
| `pt-BR` | **padrão** (mercado principal) | raiz, sem prefixo (`/`, `/sobre`) | — |
| `en-US` | internacional (inglês) | `/en` | pt-BR |
| `es-ES` | internacional (espanhol) | `/es` | pt-BR |
| `pt-PT` | Portugal | `/pt` | **pt-BR** (herda o português brasileiro e sobrescreve o que difere) |

`frontend/i18n/config.ts` — `locales`, `defaultLocale`, `fallbackLocale`, `localeLabels`, `isLocale`, `normalizeLocale`, `resolveLocale`.

## 2. Arquitetura do núcleo de i18n (sem dependência externa)

Optamos por um núcleo próprio em vez de `next-intl` porque o store do pnpm no ambiente era de outra major e qualquer `pnpm add`/`npm install` arriscava quebrar o lockfile que a Vercel consome (`ERR_PNPM_OUTDATED_LOCKFILE`). O núcleo tem ~4 arquivos e é testado:

| Arquivo | Responsabilidade |
|---|---|
| `i18n/config.ts` | locales, fallback, normalização de variantes (`pt` → `pt-BR`, `en-GB` → `en-US`, `es-MX` → `es-ES`) e `resolveLocale` |
| `i18n/runtime.ts` | `translate`, `createTranslator`, `translateList`, `mergeMessages`, `fallbackChain` |
| `i18n/server.ts` | `getLocale`, `loadMessages`, `getTranslator`, lista de `NAMESPACES` e carregamento por locale |
| `i18n/provider.tsx` | `I18nProvider`, `useT`, `useLocale`, `useLocaleOptions`, `setLocale` (cookie + `PATCH /auth/preferences` + reload) |
| `i18n/urls.ts` | `localePath`, `splitLocalePrefix`, `localeFromPrefix`, `alternateLanguages` |

## 3. Resolução de idioma e cadeia de fallback

Ordem efetiva (documentada e testada em `test/i18n.test.ts`):

1. **Preferência do perfil** (`user.locale` / `company.locale` via sessão) — sempre vence
2. **Idioma do caminho** (`/en`, `/es`, `/pt`, injetado pelo middleware como `x-mangora-locale`)
3. **Cookie** `MANGORA_LOCALE`
4. **`Accept-Language`** (respeitando a ordem de prioridade declarada)
5. **`pt-BR`** (padrão)

Sem repetir consulta ao banco: a leitura da sessão é memoizada com `cache()` do React.

## 4. Catálogos e paridade

- **36 namespaces × 4 idiomas = 2.492 chaves por locale** (`frontend/messages/<locale>/*.json`)
- Namespaces cobrem domínio (`sales`, `pdv`, `products`, `stock`, `customers`, `suppliers`, `finance`, `reports`, `employees`, `units`, `bank`, `operations`, `cashRegister`-keys em `modules`…), superfícies (`navigation`, `dashboard`, `settings`, `forms`, `orders`, `billing`, `publicUi`, `publicPages`, `landing`, `site`, `systemAdmin`, `accountSecurity`, `aiManager`, `purchases`, `categories`, `services`, `pageMeta`) e base (`common`, `validations`, `statuses`, `paymentMethods`, `errors`)
- **Paridade por teste**: `test/i18n.test.ts` compara a lista de chaves de cada namespace com o `pt-BR` e falha se faltar ou sobrar chave
- Carregamento **só do idioma ativo** via `import()` dinâmico por namespace

## 5. Chaves semânticas e APIs de tradução

- Chaves semânticas, **nunca condicionais de idioma no código**: `t("pdv.payment.required")`, `t("purchases.form.errors.dueDate")`
- **Interpolação** `{param}`: `t("pdv.payment.submit", { total: formatCurrency(total) })`
- **Plural** por `count` com sufixos `One`/`Other`: `t("calendar.days", { count })`
- **Listas** (itens de páginas informativas): `translateList(messages, "publicPages.support.channelsItems")` ou índice `t("...channelsItems.0")`
- `t()` **nunca lança**: devolve a própria chave e registra `[i18n] Missing translation: …` fora de produção
- `test/i18n-keys.test.ts` percorre `components/` e `app/`, extrai toda chamada `t("namespace.chave")` literal e **falha se a chave não existir** no catálogo — hoje: **0 chaves ausentes**

## 6. Códigos armazenados × apresentação

Regra: **o banco guarda código; a interface traduz**. Nenhum dado do usuário é traduzido (nome de produto, descrição, nome de cliente permanecem como digitados).

| Domínio | Códigos | Chave usada |
|---|---|---|
| Status de venda/pedido/compra | `ACTIVE`, `PAID`, `PENDING`, `OVERDUE`… | `statuses.*`, `sales.status.*`, `purchases.*` |
| Planos | `FREE`, `START`, `BUSINESS`, `PREMIUM`, `ENTERPRISE` | `systemAdmin.plans.codes.*` |
| Assinatura | `TRIAL`, `PAST_DUE`, `CANCELLED` | `systemAdmin.status.*`, `billing.*` |
| Papéis/vínculo | `OWNER`, `ADMIN`, `SELLER`, `CASHIER`… | `employees.roles.*` |
| Formas de pagamento | `PIX`, `CREDIT_CARD`, `CASH`, `BILLET`… | `paymentMethods.*`, `pdv.methods.*` |
| Tipos de catálogo | `PRODUCT`, `SERVICE` | `categories.itemTypes.*` |
| Canais de pedido | `COUNTER`, `PICKUP`, `DELIVERY`, `SCHEDULED` | `orders.channels.*` |
| Tipos de histórico | `PLAN_CHANGED`, `PRICE_CHANGED`… | `billing.history.*` |
| Segmentos (cadastro) | `RETAIL`, `RESTAURANT`… | `publicPages.register.segments.*` |

Helper específico para códigos com fallback ao valor cru: `codeLabel(prefix, value, t)` em `components/system-admin/SystemAdminConsole.tsx`.

## 7. Datas, horas, moedas, números e percentuais

`frontend/lib/format.ts` expõe tudo com o locale ativo (e permite forçar outro para exportações):

| Função | Exemplo `pt-BR` × `en-US` |
|---|---|
| `formatCurrency` | `R$ 1.249,90` × `$1,249.90` |
| `formatNumber` | `1.500,5` × `1,500.5` |
| `formatPercent` / `formatPercentage` | `12,5%` × `12.5%` |
| `formatDate` / `formatDateLong` / `formatDateTime` / `formatTime` | `15/09/2026` × `Sep 15, 2026` |

Fuso e arredondamento continuam sendo **configuração de empresa/market**, não do idioma (`lib/timezone.ts`, `brazilDateKey`).

## 8. Preferências regionais separadas (país × idioma × moeda × fuso)

O briefing exige que país, idioma, moeda e fuso sejam **preferências independentes** — trocar idioma não muda mercado nem moeda:

- `frontend/lib/regional/options.ts`: `REGION_CODES`, `CURRENCY_CODES`, `REGION_DEFAULT_TIMEZONE/CURRENCY`, `TIME_ZONE_OPTIONS` (IANA), `regionName`/`currencyName` via `Intl.DisplayNames`
- UI em **Configurações → Preferências regionais** (`SettingsPanel`, aba própria, salva no mesmo submit do painel)
- Persistência: `PATCH /auth/preferences` (`UpdatePreferencesDto`: `locale` com whitelist, `country` ISO-2, `preferredCurrency` enum Prisma, `timezone` regex IANA)

## 9. SEO por idioma

- `generateMetadata()` em layout global, landing e páginas públicas: `title`, `description`, `openGraph` (inclui `og:locale` derivado do locale ativo), `twitter`, `keywords`, `category`
- **`canonical` autorreferente por idioma** (`/sobre`, `/en/sobre`, `/es/sobre`, `/pt/sobre`)
- **`hreflang` por caminho** (`alternateLanguages`): `pt-BR`, `pt-PT`, `en-US`, `es-ES` + `x-default` → pt-BR
- `<html lang>` sempre igual ao locale ativo

Verificado em servidor de produção local (`next start -p 3111`):
```
/en/sobre → <html lang="en-US"> · canonical /en/sobre · conteúdo em inglês
            set-cookie: MANGORA_LOCALE=en-US · x-middleware-rewrite: /sobre
<link rel="alternate" hrefLang="pt-BR|pt-PT|en-US|es-ES|x-default" …>
```

## 10. URLs com prefixo de idioma

`middleware.ts` reescreve `/en|/es|/pt` para o caminho real, publica o idioma no cabeçalho `x-mangora-locale` e grava o cookie. **As rotas do app (`/dashboard`, `/pdv`, `/produtos`, …) continuam sem prefixo e intactas** — nenhum link existente quebra. `pt-BR` permanece na raiz por decisão de SEO.

## 11. E-mails transacionais no idioma do destinatário

Escopo aprovado: **apenas os essenciais**.

- `backend/src/email/email-copy.ts` — catálogos nos 4 idiomas + `resolveEmailLocale()` (alias `pt`, `en`, `en-GB`, `es-MX`; fallback pt-BR) + `fillCopy()`
- `EmailService.passwordReset({ locale })` e `EmailService.securityAlert({ locale, kind })` com `kind` tipado: `ACCOUNT_LOCKED`, `NEW_DEVICE`, `PASSWORD_CHANGED`, `PASSWORD_RESET_COMPLETED`, `EMAIL_CONFIRMATION_CODE`
- Chamadas enviam `user.locale`; a data do “novo acesso” é formatada no idioma do destinatário
- **Fora do escopo por decisão**: resumo periódico, aniversário e tempo de casa seguem em pt-BR
- Testes: `src/email/email-copy.spec.ts` (resolução de locale, paridade de chaves, ausência de texto pt-BR nos outros idiomas, interpolação)

## 12. Documentos e impressos

Regra aprovada: **cupom térmico/recibo seguem o idioma do operador**; **documentos fiscais (NF-e, DANFE e correlatos) permanecem sempre em pt-BR**, por exigência legal brasileira e por compatibilidade com o layout da SEFAZ. Nenhum layout fiscal foi alterado.

## 13. Formulários, validações, tabelas, modais, toasts e erros

Migrados de ponta a ponta nos módulos do item 14:

- **Validações** com mensagem por chave (`validations.*`, `*.errors.*`) e regras do backend preservadas (as mensagens da API são repassadas quando existem; o texto local é fallback)
- **Tabelas** com cabeçalhos, ações (`aria-label`), paginação e estados vazios traduzidos (`t("...page", { current, total })`, `Empty`, `Loading`)
- **Modais** (incluindo `WorkspaceModal`, que confirma a operação com senha) e **toasts** de sucesso/erro com nome do recurso interpolado
- **Central de notificações** e tempo relativo (“agora”, “ontem”, “há X dias”)

## 14. Cobertura por módulo

| Módulo | Situação |
|---|---|
| Navegação, sidebar, cabeçalho e busca global | ✅ |
| Dashboard (métricas, gráficos, estoque mínimo, vendas recentes, notificações) | ✅ |
| PDV (catálogo, carrinho, revisão, pagamento, prévia, cadastro rápido de cliente, atalhos, caixa) | ✅ |
| Vendas (catálogo, detalhes, cancelamento, devolução, nova venda) | ✅ |
| Produtos e serviços e categorias (catálogos e formulários) | ✅ |
| Estoque (visão, movimentação, transferências, inventário, lotes) | ✅ |
| Compras (catálogo, detalhes, recebimento, cancelamento, nova compra) | ✅ |
| Caixa e auditoria (turno, movimentações, LOG) | ✅ |
| Clientes e fornecedores (catálogos, formulários, exclusão) | ✅ |
| Financeiro (visão, lançamentos, contas, recorrências, conciliação) | ✅ |
| Relatórios (períodos, métricas, exportação, tabelas) | ✅ |
| Funcionários (lista, papéis, permissões, celebrações) | ✅ |
| Assinatura (planos, contrato, histórico, trial) | ✅ |
| Configurações (empresa, vendas, notificações, preferências regionais, segurança) | ✅ |
| Central de administração da plataforma e Gerente de IA | ✅ |
| Auth (login, cadastro, segurança da conta/A2F, recuperar e redefinir senha) | ✅ |
| Site público (landing, demonstração, sobre, parceiros, segurança, LGPD, termos, privacidade, suporte) | ✅ |
| E-mails essenciais | ✅ |

## 15. Robustez, fallback e anti-regressão

- `pt-PT` herda de `pt-BR` chave a chave (`mergeMessages`), sem “buracos” de tradução
- `t()` devolve a chave quando falta tradução e avisa no console (fora de produção) — nada quebra em produção
- **Dois testes de contrato** garantem o futuro: paridade de chaves entre os 4 idiomas (`test/i18n.test.ts`) e todas as chaves usadas no código existirem no catálogo (`test/i18n-keys.test.ts`)
- O teste de chaves já pegou 3 regressões reais durante a migração (metadados do suporte sobrescritos, `services.form.fields.save` inexistente, `stock.toast` apontando para um objeto)

## 16. Verificação, ferramentas e pendências

**Ferramentas duráveis**
- `frontend/scripts/i18n-inventory.mjs` → `frontend/docs/i18n-inventory.md`: heurística de textos hardcoded (**82 → 21 candidatos**, sendo os 21 restantes majoritariamente `×`, comentários, exemplos de CSV/OFX e defaults intencionais)
- `frontend/docs/i18n-glossary.md`: fonte única de termos (inclui decisões de mercado como *Boleto* × *Multibanco*)
- `frontend/test/i18n*.test.ts`: paridade, resolução, formatação, URLs e integridade de chaves

**Verificação final**
| Gate | Resultado |
|---|---|
| `npx tsc --noEmit` (frontend) | limpo |
| `npm test` (frontend) | 15 arquivos / 75 testes |
| `npx next build` (frontend) | compilado com sucesso |
| `npx tsc --noEmit -p tsconfig.build.json` (backend) | limpo |
| `npm test` (backend) | 30 suites / 139 testes |
| `hreflang`/`canonical`/`lang` em execução real | conferidos em `/en`, `/es`, `/pt` |

**Pendências e recomendações**
1. **Revisão nativa** dos textos `en-US`, `es-ES` e `pt-PT` por revisor humano antes de divulgar nesses mercados (os catálogos estão prontos para revisão em `messages/<locale>/`).
2. **21 candidatos** do inventário merecem uma passada manual (nenhum é bloqueante; ver `docs/i18n-inventory.md`).
3. **Fiscal**: se um dia houver operação fora do Brasil, reavaliar documentos fiscais país por país — hoje, por decisão, permanecem pt-BR.
4. **E-mails não essenciais** (resumo, aniversário, tempo de casa) ficam em pt-BR; promover quando houver demanda de mercado.
5. **`push`**: todos os commits de i18n estão locais; a publicação é decisão do responsável pelo produto.
