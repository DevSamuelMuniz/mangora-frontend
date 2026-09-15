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
