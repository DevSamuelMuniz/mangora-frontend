# Impressão local

## Fluxos e contratos

`PrintService` recebe documentos tipados de quatro pontos: conclusão automática do
PDV, impressão manual no PDV, reimpressão em Vendas e etiquetas. O teste de
impressão usa o mesmo serviço, com conteúdo de exemplo. A seleção de produtos, o
salvamento da venda e a atualização de estoque e financeiro continuam nos serviços
que já os atendem.

Vendas consulta `/sales/:id` e `/companies/current` ao confirmar a reimpressão,
inclusive para baixar o PDF. Uma venda cancelada ou de outra empresa é rejeitada.
O comprovante inclui subtotal, desconto, pagamentos e troco quando disponível.
O conteúdo impresso traz **DOCUMENTO NÃO FISCAL**. Os modelos `Order`,
`CashRegister` e `CashMovement` existem, mas os fluxos atuais de pedidos e caixa
não emitem documentos para impressão. Não foi localizada emissão fiscal nem
artefatos autorizados para DANFE. O histórico de auditoria contém nomes de eventos
fiscais e o catálogo de cobranças contém faturas de assinatura.

## Configurar no terminal

1. Instale o driver e teste a impressora no sistema operacional. Para envio direto,
   instale e abra o [QZ Tray](https://qz.io/download/).
2. Em Etiquetas ou na conclusão do PDV, abra **Preferências de impressão**.
   Os mesmos controles aparecem ao preparar uma reimpressão.
3. Escolha **Direto na impressora**, busque e selecione uma fila local. Cupons e
   etiquetas têm destinos independentes. Autorize o acesso à rede local se o
   navegador solicitar e confira o destino na autorização do QZ.
4. Em comprovantes, ajuste bobina de 58 ou 80 mm e de uma a cinco vias. Use
   **PDF pelo driver** para filas gráficas. Habilite a rasterização se o driver
   precisar de bitmap. Em etiquetas, as quantidades continuam por produto.
5. Para comprovantes em fila compatível com RAW, selecione **ESC/POS (RAW)** e a
   tabela PC850 ou PC858 compatível com o firmware. Marque guilhotina e QR nativo
   somente se o modelo implementar esses comandos. A opção de corte aparece após
   declarar a guilhotina. Caracteres fora da página selecionada geram erro antes
   do envio. Use PDF para o repertório suportado pelas fontes desse formato.
6. Clique em **Imprimir teste**. Confira acentuação, largura, vias, avanço e, se
   habilitados, corte e leitura do QR. Depois ajuste a preferência de automação.
7. Em caso de falha na ponte, use **Baixar PDF** na preparação ou troque para o
   diálogo do navegador. Ajuste o papel e a escala a 100% no driver.

O teste de etiqueta usa um CODE128 fictício. O QR do teste de comprovante contém
texto de diagnóstico, sem dados de pagamento. O PDF de etiquetas usa barras
vetoriais e preserva zeros iniciais. A bobina contínua agrupa as etiquetas e
divide páginas longas conforme a altura de cada trecho.

### Knup KP-1025

O [perfil do fabricante](https://knup.com.br/produto/kp-1025/) especifica bobina
de 58 mm e área útil de 48 mm. O perfil mantém envio pelo driver, centraliza a
etiqueta de 48 × 30 mm em papel de 58 mm e bloqueia A4 e etiquetas mais largas
que a área útil. Selecione a fila instalada após a busca. A altura de 30 mm é o
formato inicial da etiqueta.

## Escopo, fila e diagnóstico

As preferências ficam por empresa no perfil do navegador do terminal. Não há
cadastro persistente de terminais. Dois caixas no mesmo computador que usem a
mesma empresa precisam de perfis de navegador separados se usarem filas
diferentes. A migração reaproveita papel, modelo, automação e download do
armazenamento anterior. A seleção da fila direta exige nova configuração por
empresa.

A fila da aba serializa os trabalhos, atribui IDs e guarda até 100 registros de
status em memória. O histórico contém tipo, transporte, horário e motivo da falha.
Na automação, a tentativa fica registrada por empresa e venda antes do envio.
A proteção usa Web Locks quando disponíveis e conserva até 256 tentativas recentes
por empresa durante sete dias. Se o armazenamento estiver bloqueado, a proteção
em memória vale durante a sessão da página. Uma reimpressão manual posterior
permanece possível.

A descoberta identifica filas instaladas. A confirmação do QZ indica submissão ao
spooler. O aplicativo mostra falta de papel ou recusa quando a ponte informa essa
condição. Timeout, desconexão durante o envio e falha depois de uma página aceita
podem deixar o resultado indeterminado. Confira o spooler antes de reimprimir.
A fila não reenvia trabalhos automaticamente. O navegador informa que o diálogo
foi acionado. A decisão de imprimir ou cancelar fica no diálogo do sistema.

## Segurança do QZ Tray

A conexão usa WebSocket seguro em `localhost`. A CSP permite somente as quatro
portas seguras do QZ nesse host e frames `blob:` para o PDF local. O adaptador verifica se o nome
selecionado está entre as filas locais antes do envio. O QZ Tray aplica a
autorização do operador na estação, e o aplicativo usa o modo sem certificado.
As antigas rotas de certificado e assinatura foram removidas. A assinatura
anterior validava o envelope PDF, mas assinava conteúdo e destinos fornecidos
pelo cliente sem vínculo com impressoras cadastradas. As variáveis
`QZ_CERTIFICATE` e `QZ_PRIVATE_KEY` deixaram de ser usadas neste módulo.
Impressão silenciosa com certificado exigiria autorização do destino e do
documento no servidor, além de provisionamento local da confiança.

O renderizador RAW limita o texto às páginas de código configuradas e remove
caracteres de controle dos campos. Os bytes ESC/POS vêm do renderizador. O corte
e o QR nativo são opcionais. A largura em colunas pressupõe fonte A de 32 ou 42
colunas, conforme a bobina, e deve ser conferida no equipamento.

Referências: [QZ RAW](https://qz.io/docs/raw), [QZ PDF](https://qz.io/docs/pixel),
[QZ Signing](https://qz.io/docs/signing),
[Epson ESC/POS](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/commands.html)
e [tabelas PC850/PC858](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/esc_lt.html).

## Verificação

Os testes automatizados de impressão cobrem a fila simulada, integração com o
cliente QZ simulado, escopo de empresa, preferências, dimensões de PDFs,
etiquetas, comprovantes longos, acentos, desconto, quantidades, QR, vias,
reimpressão, erro de conexão e recuperação manual.

Resultado da migração: 44 testes de impressão passaram. O build, o TypeScript
e o lint dos arquivos alterados passaram. O Chrome no Windows foi exercitado
em 1280 px e 390 px com QZ simulado, incluindo seleção por teclado, falta de
papel, desconexão e download de PDF com duas vias. A suíte geral teve 201 testes
aprovados e três falhas anteriores à migração, em chaves de tradução e no
mock do roteador do teste de preferências regionais.
O Chrome também carregou o PDF local com a CSP do build de produção e
bloqueou uma porta fora da lista do QZ.

Para homologar no balcão, valide uma fila gráfica e uma fila RAW em Windows,
permissão de rede local e autorização real no QZ Tray, papel de 58/80 mm,
corte, scanner de código de barras/QR, desconexão e falta de papel em cada modelo.

## Arquivos da migração

- Núcleo em `lib/printing`: `types.ts`, `service.ts`, `preferences.ts`,
  `scope.tsx`, `use-print-preferences.ts` e `messages.ts`.
- Renderização em `receipt.ts`, `receipt-pdf.ts`, `label-pdf.ts` e `escpos.ts`.
- Transporte em `qz-connection.ts`, `qz-tray-adapter.ts`,
  `system-printer-adapter.ts` e `browser-pdf-adapter.ts`. A CSP está em
  `next.config.ts`.
- Integrações em `app/pdv/page.tsx`, `app/(dashboard)/layout.tsx`,
  `DoneStep.tsx`, `SalesCatalog.tsx` e `LabelWorkspace.tsx`. Controles e
  prévia em `PrintSettings.tsx`, `PrintDialog.tsx` e `ReceiptPrintPreview.tsx`.
  Os quatro catálogos `messages/*/labels.json` receberam o texto da interface.
- Testes em `printing.test.ts`, `print-service.test.ts`, `printing-ui.test.tsx`,
  `sales-receipt.test.tsx` e `label-workspace.test.tsx`. A implementação
  `lib/pdv/print.ts`, `lib/printing/signing.ts`, as duas rotas de assinatura e
  seu teste foram removidos. Os contratos estão em `DESIGN.md` e `UX-CONTRACT.md`.
