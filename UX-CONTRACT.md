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
