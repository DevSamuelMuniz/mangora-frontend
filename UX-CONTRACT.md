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
- Erros preservam o produto/venda para nova tentativa após conferir a fila.
- Usar controles nativos de seleção: popup e teclado pertencem ao sistema operacional.
- O perfil Knup KP-1025 aplica as medidas publicadas pelo fabricante (58 mm de
  papel, 48 mm úteis), referenciadas em docs/printing.md. A escolha é local ao
  navegador; não muda o perfil das demais lojas.
- Esta mudança não altera autorização de vendas, cobrança ou ciclo de vida dos dados.
