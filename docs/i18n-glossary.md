# Glossário oficial Mangora (i18n)

Fonte única para manter consistência entre **interface, e-mails, notificações, site, relatórios e documentação**.
Sempre traduzir por este glossário — nunca palavra por palavra.

| Termo (pt-BR) | en-US | es-ES | pt-PT | Notas de contexto |
|---|---|---|---|---|
| Produto | Product | Producto | Produto | item vendido |
| Serviço | Service | Servicio | Serviço | item sem estoque |
| Venda | Sale | Venta | Venda | operação concluída |
| PDV | POS | TPV (Punto de venta) | POS | frente de caixa |
| Caixa (tela) | Cash Register | Caja | Caixa | abertura/fechamento |
| Caixa (dinheiro físico) | Cash | Efectivo | Numerário | forma de pagamento |
| Cliente | Customer | Cliente | Cliente | quem compra |
| Fornecedor | Supplier | Proveedor | Fornecedor | quem fornece |
| Estoque | Inventory | Inventario | Inventário | saldo de produtos |
| Inventário físico | Physical count | Conteo físico | Contagem física | contagem de estoque |
| Lote | Batch | Lote | Lote | rastreio/validade |
| Pedido | Order | Pedido | Encomenda | venda online/WhatsApp |
| Compra | Purchase | Compra | Compra | reposição de estoque |
| Fiado | Store credit | Fiado | Crédito de loja | pagamento a prazo |
| Boleto | Bank slip | Boleto bancario | Referência Multibanco | contexto BR vs PT |
| Contas a receber | Accounts receivable | Cuentas por cobrar | Contas a receber | financeiro |
| Contas a pagar | Accounts payable | Cuentas por pagar | Contas a pagar | financeiro |
| Ticket médio | Average ticket | Ticket medio | Ticket médio | relatórios |
| Relatório | Report | Informe | Relatório | — |
| Lojas (unidades) | Stores | Tiendas | Lojas | multiempresa |
| Assinatura | Subscription | Suscripción | Subscrição | billing |
| Cupom | Coupon | Cupón | Cupão | billing |
| Nota fiscal | Invoice | Factura | Fatura | documento fiscal |
| Pix | Pix | Pix | Pix | nome do método — **não traduzir** |
| Painel | Dashboard | Panel | Painel | início do sistema |

## Regras

1. **Status e enums nunca são armazenados traduzidos** (`PAID`, `ACTIVE`, `OVERDUE` no banco; tradução na apresentação).
2. **Dados do usuário não são traduzidos** (nome de produto, descrição, cliente).
3. Valores monetários usam o **locale do usuário** (`Intl.NumberFormat`), não o país da operação.
4. Novos termos entram **primeiro neste glossário** e depois nos catálogos `messages/<locale>/`.

## Decisões de produto que afetam a tradução

| Tema | Regra |
|---|---|
| Preferências regionais | país, idioma, moeda e fuso são **independentes**; trocar idioma não muda mercado nem moeda |
| Impressos | **cupom térmico/recibo** seguem o idioma do operador; **documentos fiscais (NF-e, DANFE)** permanecem sempre em pt-BR |
| E-mails | apenas os **essenciais** (redefinição de senha, alerta de segurança, confirmação de e-mail) seguem `user.locale`; resumo, aniversário e tempo de casa ficam em pt-BR |
| URLs públicas | `pt-BR` na raiz; `/en`, `/es`, `/pt` para os demais, via `middleware.ts`; rotas do app sem prefixo |
| Fallback | `pt-PT` herda de `pt-BR`; falta de chave nunca quebra a tela (retorna a própria chave) |

## Como adicionar ou alterar um texto

1. Termo novo? Registre neste glossário (colunas `en-US`, `es-ES`, `pt-PT`).
2. Escolha o namespace existente (ver `frontend/i18n/server.ts` → `NAMESPACES`) e use **chave semântica** (`modulo.grupo.chave`).
3. Adicione a chave nos **quatro** arquivos `messages/<locale>/<namespace>.json` — a paridade é exigida pelo teste `test/i18n.test.ts`.
4. No código use `t("modulo.grupo.chave")`; para valores use interpolação (`t("...", { total })`) e, para contagem, `{ count }` com chaves `...One`/`...Other`.
5. Códigos vindos da API (status, plano, papel, forma de pagamento) **nunca** viram texto: traduza na apresentação pela chave do código.
6. Rode o gate: `npx tsc --noEmit && npx eslint <arquivos> && npm test && npx next build`.
7. Se o texto for público (site, páginas informativas), confira `canonical`, `hreflang` e `<html lang>`.

## Onde cada coisa mora

| Preciso… | Procure em |
|---|---|
| Configuração de locales e fallback | `frontend/i18n/config.ts` |
| Namespaces e carregamento por idioma | `frontend/i18n/server.ts` |
| URLs com prefixo e `hreflang` | `frontend/i18n/urls.ts`, `frontend/middleware.ts` |
| Formatação de datas/moeda/número/% | `frontend/lib/format.ts` |
| Regiões, moedas e fusos disponíveis | `frontend/lib/regional/options.ts` |
| Textos por idioma | `frontend/messages/<locale>/*.json` |
| Textos dos e-mails essenciais | `backend/src/email/email-copy.ts` |
| Textos possivelmente esquecidos | `frontend/docs/i18n-inventory.md` (regerar com o script) |
| Estado final do projeto | `frontend/docs/i18n-final-report.md` |
