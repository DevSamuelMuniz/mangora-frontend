# Impressão local

## Arquitetura e decisão

Etiquetas e cupons usam jsPDF para produzir PDFs com medidas físicas explícitas.
JsBarcode mantém o CODE128 e seus zeros iniciais; os módulos são desenhados como
vetores, sem captura de tela. O serviço compartilhado usa QZ Tray para enviar o PDF
à impressora instalada no computador do usuário. O modo navegador mantém um caminho
com diálogo para quem ainda não instalou o agente local.

Referências pesquisadas:

- https://github.com/parallax/jsPDF — páginas e unidades personalizadas.
- https://qz.io/docs/pixel — PDF, margens, escala e formato físico.
- https://qz.io/docs/signing — assinatura para remover avisos de autorização.
- https://github.com/parzibyte/plugin-ticket-js — alternativa voltada a ESC/POS.

QZ foi escolhido por atender impressoras cadastradas no sistema e PDFs de etiquetas,
A4 e cupons com o mesmo transporte. O driver deve aceitar impressão gráfica/PDF;
dispositivos somente RAW precisam de outro adaptador (ESC/POS, ZPL ou TSPL).

## Configuração no computador do operador

### Knup KP-1025

Modelo informado pelo operador. Fonte oficial:
https://knup.com.br/produto/kp-1025/ — bobina nominal de **58 mm** e impressão
efetiva de **48 mm**. A medida manual de 5,5 cm informada não foi tratada como
largura útil: o driver deve usar o formato nominal de 58 mm.

Em Preferências de impressão, escolher **Modelo da impressora → Knup KP-1025**.
Esse perfil salva cupom de 58 mm, etiquetas de 48 × 30 mm e bobina contínua.
O PDF usa página de 58 mm e centraliza a etiqueta de 48 mm; cupons de 58 mm
também limitam as linhas a 48 mm úteis. A4 e etiquetas mais largas que 48 mm
são bloqueados enquanto esse perfil estiver ativo. A altura de 30 mm é uma
configuração inicial de layout, não um intervalo físico imposto pelo equipamento.

O perfil não adivinha o nome da fila no Windows: o operador seleciona a
impressora instalada após buscar pelo QZ Tray. Outras lojas mantêm seu perfil
genérico; a escolha do modelo é local ao navegador.

### Instalação

1. Instalar o driver oficial e testar a impressora pelo sistema operacional.
2. Instalar o QZ Tray de https://qz.io/download/ e mantê-lo aberto.
3. Em Etiquetas ou na conclusão de uma venda, abrir Preferências de impressão.
4. Selecionar Direto na impressora, buscar e selecionar a impressora local.
   Etiquetas e cupons têm impressoras independentes.
5. Para papel como o da ocorrência, usar **Bobina contínua / sem intervalos**.
   As etiquetas ficam na mesma página/faixa, sem uma página por etiqueta.
   Para etiquetas pré-cortadas, escolher uma etiqueta por página; para folhas, A4.
6. Informar as medidas reais. Cupons suportam bobinas de 58 ou 80 mm.
7. Fazer um teste, conferir a leitura do código e o avanço/corte do driver.

Sem impressora disponível no ambiente de desenvolvimento, a saída física permanece
dependente desse teste. O firmware pode impor avanço mínimo, corte e área não
imprimível. O sistema não deve compensar isso com páginas A4 ou escala automática.

## Assinatura em produção

Configurar `QZ_CERTIFICATE` com o certificado PEM confiável pelo QZ e
`QZ_PRIVATE_KEY` com a chave RSA correspondente no servidor Next. As variáveis
aceitam quebras de linha reais ou `\n`. Nunca usar prefixo NEXT_PUBLIC_ nem enviar
a chave ao navegador. Provisionar a confiança/autorização do site no QZ conforme
as instruções oficiais; apenas preencher variáveis não estabelece confiança.

O cliente calcula o SHA-256 da mensagem QZ e mantém seu payload até a assinatura.
O endpoint autenticado verifica origem, sessão, tamanho, timestamp e operações
permitidas antes de assinar o hash com RSA-SHA512. Só descoberta de impressoras e
PDF inline são aceitos; arquivos locais, URLs e comandos RAW não são assinados.
Não há registro do conteúdo do PDF nos logs. Sem certificado, o QZ pede autorização;
não há promessa de impressão silenciosa antes dessa configuração.

## Salvamento e automação

As preferências são locais ao navegador/computador, sem produtos ou dados de venda
no localStorage. As medidas válidas são salvas ao alterar os controles. Uma venda
registrada inicia a impressão do cupom por padrão; o operador pode desativar essa
preferência. O PDF é baixado por padrão antes do envio, inclusive se o QZ falhar.
O destino depende das configurações do navegador; um site não pode escolher
arbitrariamente uma pasta ou suprimir o diálogo de salvamento do usuário.

Uma tentativa automática é marcada por ID de venda na sessão antes de enviar,
com proteção adicional em memória contra remontagens/Strict Mode. Não há retry
automático após falha: o trabalho pode já estar no spooler. Conferir a fila antes
de reimprimir manualmente. Trabalho enviado não significa saída física confirmada.
Cupons e bobinas com mais de 990 mm são divididos; cada parte usa sua altura real,
inclusive a última. Isso evita área vazia por reutilização da altura da primeira.

## Verificação

`npm test`, `npx tsc --noEmit`, `npm run lint` e `npm run build`.
Os testes de impressão verificam medidas reais do PDF, quantidade de páginas,
CODE128, rolos, A4, paginação longa, preferências, configuração QZ e falhas sem retry.

Resultado desta alteração (02/11/2026):

- 27 testes de etiquetas, transporte, assinatura e interface passaram.
- Após acrescentar o perfil KP-1025 informado pelo operador: 29 testes passaram,
  incluindo papel de 58 mm, restrição de largura útil e persistência do perfil.
- TypeScript e build de produção passaram; lint dos arquivos alterados passou.
- Suíte geral: 150 passaram e 2 falharam em chaves de tradução já ausentes no HEAD
  (`products.stock.reservedShort` e diferenças de billing entre pt-BR e pt-PT).
- Lint geral mantém 2 erros anteriores em SystemAdminConsole e useConnectivity,
  além de 2 avisos em BillingConfigPanel. Auditoria estática preservada em
  `printing-audit.json`: 5 ocorrências anteriores nas telas públicas de autenticação.
- Controles compartilhados conferidos no navegador em desktop e 390px; seleção
  nativa e propagação das preferências entre os dois usos verificadas.
- PDF de referência conferido visualmente e com leitor independente: duas
  etiquetas de 50 × 30 mm em uma única página de 50 × 60 mm.
- O ambiente lista apenas Microsoft Print to PDF e AnyDesk Printer: impressão
  térmica física, leitura por scanner e integração com um QZ instalado seguem
  pendentes de validação no computador com a impressora do operador.
