# Contratos de interação

Este documento registra o fluxo de impressão solicitado pelo proprietário do
produto nesta alteração. Demais fluxos continuam regidos pelas implementações
compartilhadas e por `ARCHITECTURE.md`.

| Capability | Canonical owner | Source of truth | Allowed variants | Verification |
|---|---|---|---|---|
| Select/Listbox | Native HTML select | DESIGN.md; controles existentes de Etiquetas | native | test/label-workspace.test.tsx; revisão visual |

## Impressão

- `PrintSettings` é o proprietário das preferências compartilhadas; selecionar
  impressora, método e automação mantém o mesmo significado em Etiquetas e PDV.
- Fonte do comportamento: solicitação do proprietário de salvar e imprimir
  automaticamente, sem o intervalo excessivo na bobina; detalhes em docs/printing.md.
- Configurações são locais ao navegador e ficam salvas automaticamente. Nenhuma
  seleção de produtos ou dado de cliente é persistido por essa preferência.
- Ao registrar a venda, iniciar uma tentativa de cupom se autoReceipt estiver ativa.
  Não repetir automaticamente uma tentativa ambígua. A ação manual permite reimprimir.
- Só informar envio ao spooler; não alegar impressão física concluída.
- Na lista de vendas, reimprimir é uma ação manual por venda concluída, disponível
  na linha e nos detalhes. Essas ações abrem `PrintDialog`, que também prepara
  etiquetas e cupons manuais do PDV. Consultar a venda e a empresa ao confirmar;
  reutilizar `printReceipt` e as preferências locais do PDV. Abrir os detalhes
  ou o modal não dispara impressão/download. Uma falha não deve provocar reenvio
  automático. O envio só ocorre em “Confirmar impressão”. Enquanto envia,
  bloquear alterações e fechamento para evitar uma tentativa ambígua.
- O modal mostra resumo do documento, perfil e fila local, papel, método e
  preferências persistidas. Em etiquetas, permitir medidas, papel e quantidades
  dentro da preparação, com prévia e validações antes de habilitar a confirmação.
- A impressão automática de conclusão do PDV permanece regida por `autoReceipt`;
  a confirmação do modal é obrigatória para ações manuais.
- Erros preservam o produto/venda para nova tentativa após conferir a fila.
- Usar controles nativos de seleção: popup e teclado pertencem ao sistema operacional.
- O perfil Knup KP-1025 aplica as medidas publicadas pelo fabricante (58 mm de
  papel, 48 mm úteis), referenciadas em docs/printing.md. A escolha é local ao
  navegador; não muda o perfil das demais lojas.
- Esta mudança não altera autorização de vendas, cobrança ou ciclo de vida dos dados.

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
| Form | ModalDialog + validação antes da mutação | servidor e atributos dos campos | checkout / admin editor | testes e build |

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
