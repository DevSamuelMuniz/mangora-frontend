# Contratos de interação

Este documento registra o fluxo de impressão solicitado pelo proprietário do
produto nesta alteração. Demais fluxos continuam regidos pelas implementações
compartilhadas e por `ARCHITECTURE.md`.

| Capability | Canonical owner | Source of truth | Allowed variants | Verification |
|---|---|---|---|---|
| Select/Listbox | Native HTML select | DESIGN.md; controles existentes de Etiquetas | native | test/label-workspace.test.tsx; revisão visual |
| Label drawing | lib/printing/label-pdf.ts + components/labels/LabelPreview.tsx | Pedido do proprietário: nome, código do produto, código de barras e preço | compact / standard; roll / continuous / A4 | test/printing.test.ts; test/labels-browser/labels.spec.ts |
| Scrollbar | app/globals.css | DESIGN.md | global / forced-colors | test/labels-browser/labels.spec.ts |

## Impressão

- O navegador oferece as impressoras disponíveis no dispositivo. O Mangora
  abre a janela nativa de impressão com o documento isolado. A confirmação final e o
  cancelamento acontecem nessa janela.
- As preferências do documento são locais ao navegador e separadas por empresa.
  A leitura de preferências antigas aproveita papel, medidas, vias, automação e
  download. Modelo, fila e conexão deixam de influenciar o documento.
- O cupom automático do PDV solicita a janela de impressão uma vez por venda
  quando a preferência estiver habilitada. Uma nova tentativa é manual.
- Em Vendas, ações na lista e nos detalhes abrem o mesmo diálogo de preparação
  usado pelo PDV e por Etiquetas. A reimpressão consulta a venda e a empresa
  ao confirmar. Cupom disponível para vendas concluídas.
- Abrir a preparação preserva a seleção e permite revisar o conteúdo. “Abrir
  impressão” solicita a janela do navegador. “Baixar PDF” baixa o documento.
  Durante a preparação, os controles ficam bloqueados. Uma falha permite
  tentar novamente ou baixar o PDF.
- Em Etiquetas, medidas, papel e quantidades podem ser ajustados na preparação.
  Os campos de seleção de formato usam os controles nativos do navegador.
- O código do produto é o SKU cadastrado, separado do valor codificado nas barras.
  A regra existente de código de barras numérico e fallback para SKU numérico
  permanece em `lib/labels.ts`. Os zeros à esquerda são preservados. A prévia
  compartilha o desenho da impressão e do PDF; nomes longos recebem reticências.
  A busca local e a seleção do lote são transitórias; limpar a busca mantém a seleção.

## Assinatura e cobrança

Fonte de regras: [contrato de cobrança do backend](../mangorabackend/docs/billing.md),
política do proprietário de 07/11/2026 e autorização em SubscriptionsController /
SystemAdminGuard. O frontend apresenta o estado calculado pela API.

| Capability | Canonical owner | Source of truth | Allowed variants | Verification |
|---|---|---|---|---|
| Billing lifecycle | useSubscription / useReconcileSubscription | contrato de cobrança; subscriptionEnforcement | owner / member access | testes do backend; PendingSubscriptionPaymentModal.test.tsx |
| Billing details | InvoiceDetailsDialog | API com escopo de conta/grupo | owner / admin | test/billing-browser/billing.spec.ts |
| Modal | components/ui/ModalDialog.tsx | dialog nativo + foco circular | billing / admin editor | test/billing-browser/billing.spec.ts |
| Select/Listbox | HTML select | DESIGN.md; filtros de cobrança | native | browser desktop/mobile |
| Date | HTML input date | DESIGN.md; checkout e editor admin | native | validação antes da contratação |
| Form | Formulário de checkout ou ModalDialog + validação antes da mutação | servidor e atributos dos campos | checkout / admin editor | testes e build |

- Planos pagos levam a `/assinatura/checkout/[plan]`. Ao receber o link, o checkout abre o pagamento do provedor na mesma aba.
- A página de assinatura navega para `/assinatura/cobrancas`; o histórico completo
  local é paginado e o portal Paddle permite consultar o histórico do provedor.
- Filtros e página ficam na URL. Totais são agrupados por moeda, sem converter ou
  somar BRL, USD e EUR. No admin, a janela de últimos 500 registros é explícita.
- Só oferecer Pix, linha digitável, boleto e comprovante retornados pelo provedor.
  Mostrar recuperação inline quando um detalhe estiver indisponível.
- “Já paguei” consulta a confirmação e nunca libera acesso localmente. A query é
  cancelada antes de substituir o estado por uma reconciliação mais recente.
- Polling da assinatura: 15s pendente/bloqueada, 60s nos demais casos; foco e retorno
  de conexão revalidam via TanStack Query. Membros consultam somente o acesso, a cada 30s.
- Um erro 403 de cobrança invalida o estado consultado. Troca de empresa cancela
  consultas e limpa o cache para evitar exibir cobrança de outra conta.
- Aviso bloqueado persiste como banner; o modal pode ser adiado por 30min por
  conta/ciclo na sessão do navegador. Não sobrepor automaticamente a regularização.
- Cancelar cobrança e registrar recebimento manual exigem confirmação com objeto
  e valor. Botões ficam indisponíveis enquanto a mutação executa; falhas preservam
  contexto e oferecem tentativa explícita.
- Sessões de portal Paddle são temporárias, abertas em outra aba, sem cache
  persistente. Popup bloqueado oferece link explícito na mesma tela.
- Cobrança não entra em cache offline nem em fila de mutações offline. O PDV
  redireciona sessões bloqueadas; `lib/billing/access.ts` impede leituras de
  recuperação e novas mutações offline quando há bloqueio/corte conhecido.
- Verificação de navegador usa as telas e hooks reais com backend local simulado;
  não substitui homologação com credenciais sandbox dos provedores.

## Exclusão de produtos

Fonte: solicitação do proprietário de 23/11/2026 e `ProductsService.remove` no backend.

| Capability | Canonical owner | Source of truth | Allowed variants | Verification |
|---|---|---|---|---|
| CRUD | useDeleteProduct + ProductsService.remove | API com escopo de empresa e exclusão lógica | lista / cards | products.service.spec.ts; test/products-browser/products.spec.ts |
| Modal | components/ui/ModalDialog.tsx | dialog nativo + foco circular | confirmação de exclusão | test/products-browser/products.spec.ts |

- Excluir exige uma confirmação com nome e consequência. Movimentações anteriores
  não impedem a remoção; o histórico permanece e os códigos ficam disponíveis.
- A confirmação bloqueia ações e Escape durante o envio, mantém falhas visíveis
  e permite nova tentativa. Ao cancelar, restaura o foco no acionador.
- Após sucesso, o item sai do cache de produtos e as consultas de catálogo e
  estoque são atualizadas. A página é limitada ao último índice válido.
