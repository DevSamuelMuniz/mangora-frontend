# Impressão local

Notinhas do PDV, reimpressões em Vendas, etiquetas e páginas de teste usam
a janela de impressão do navegador. Cada operador escolhe nela a impressora
disponível no dispositivo e confirma ou cancela o trabalho. A janela nativa é
acionada como no Ctrl+P, com apenas o conteúdo do trabalho na prévia.

## Uso no balcão

1. Configure a impressora no sistema operacional.
2. No Mangora, ajuste o formato do documento. O cupom oferece larguras de
   58 e 80 mm. Em Etiquetas, selecione medidas, quantidades e papel.
3. Clique em **Abrir impressão**. Na janela do navegador, selecione a
   impressora e o papel correspondente. Para preservar as medidas das
   etiquetas, use escala de 100%.
4. Se a janela de impressão estiver indisponível, clique em **Baixar PDF**,
   abra o arquivo e imprima pelo visualizador.

### Papel comprido ou tamanho diferente da prévia

Uma etiqueta configurada como 4 × 4 cm corresponde a 40 × 40 mm. Para uma
única etiqueta, inclusive no modo contínuo, o documento deve ter esse tamanho.
Se a janela mostrar uma faixa comprida, confira o tamanho do papel nas
preferências da impressora no Windows e em **Mais definições** do navegador.
Selecione ou cadastre o formato correspondente ao papel instalado e use
escala de 100%, margens zero e cabeçalhos/rodapés desativados. No visualizador
de PDF, escolha tamanho real. Para cupons, use a largura configurada de 58 ou
80 mm. A página informa suas dimensões por CSS; as opções disponíveis de papel
e a alimentação física dependem do driver da impressora.

O documento isolado define o tamanho padrão em `@page`, além dos tamanhos
por página para lotes com comprimentos diferentes. Cada SVG também declara
largura e altura em milímetros; a abertura da impressão aguarda as fontes e
o cálculo do layout. A regressão de 40 × 40 mm, etiquetas em paisagem, faixa
contínua com última página menor, A4 e cupons de 58/80 mm é verificada em
`test/labels-browser/print-dimensions.spec.ts`, incluindo as dimensões reais
das páginas do PDF produzido pelo Chromium. Esses testes não operam o driver
HPRT nem verificam a saída física.

## Comportamento

O formato do documento e as preferências de download e abertura automática
ficam no navegador, por empresa. Dados antigos de modelo, fila e transporte
são ignorados. O teste usa dados fictícios e a mesma janela de impressão.

Em Vendas, a reimpressão consulta a venda e a empresa ao confirmar.
O serviço valida a venda concluída e o escopo da empresa. O comprovante
inclui a indicação de documento não fiscal.

O serviço enfileira preparações na aba e agrupa solicitações simultâneas do
mesmo documento. A abertura automática no PDV mantém uma proteção por empresa
e venda. O estado do trabalho no aplicativo indica se a janela foi solicitada
ou se o PDF foi baixado. A impressão física é acompanhada no sistema operacional.

## Etiquetas: conteúdo e verificação

Cada etiqueta contém nome, SKU do produto, código de barras com dígitos legíveis
e preço cadastrado. O SKU não substitui o código de barras. Nome longo recebe
reticências; a impressão preserva as medidas físicas e as margens de leitura.
`LabelPreview` usa o desenho vetorial de `buildLabelPdf`, também usado pelo
documento isolado do navegador e pelo download de PDF. A prévia pode diminuir
na tela para caber no celular; isso não altera a medida impressa.

Verificação desta alteração:

- 35 testes unitários/de componentes de etiquetas e impressão passaram.
- Oito verificações Playwright passaram em Chrome desktop e viewport móvel:
  seleção, busca, preparação, Escape, download, documento isolado, dimensões,
  carregamento, vazio e recuperação de falha. O documento de 30 × 20 mm foi
  renderizado com mídia de impressão, com verificação dos limites do texto.
- Build, TypeScript, ESLint dos arquivos alterados e lint de DESIGN.md passaram
  (o último mantém dois avisos sobre tokens existentes).
- `docs/labels-premium.json` define a auditoria da área de impressão;
  `docs/labels-scoped-audit.json` não contém achados. A auditoria geral em
  `docs/labels-audit.json` registra cinco problemas existentes em autenticação.
- A suíte geral mantém três falhas fora desta alteração: chave
  `products.stock.reservedShort`, paridade de traduções de clientes e montagem
  do App Router no teste de preferências regionais. O lint geral aponta um erro
  existente em `lib/offline/useConnectivity.ts` e dois avisos em BillingConfigPanel.

Os testes de navegador usam os componentes reais e uma API local simulada.
A chamada da janela nativa é interceptada; a impressão física e a leitura em
scanner precisam ser conferidas na impressora do operador, usando escala de 100%.
