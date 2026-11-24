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

## Senha de produtos e estoque

Fonte: solicitação do proprietário de 23/11/2026; contrato de backend
`../mangorabackend/docs/operation-pin.md`, `OperationPinService` e
`OperationPasswordGuard`. As regras de autorização são decididas na API.

| Capability | Canonical owner | Source of truth | Allowed variants | Verification |
|---|---|---|---|---|
| Modal | components/ui/ModalDialog.tsx | foco, Escape, top layer e restauração compartilhados | confirmação por e-mail / autorização de operação | test/products-browser/operation-pin.spec.ts |
| CRUD | useOperationPin + apiRequest | endpoints auth/operation-pin; guard global | proprietário configura / demais membros consultam estado | testes do backend e navegador |
| Form | OperationPinSettings + validação da API | código e senha numéricos de seis dígitos | enviar / confirmar / criar senha | test/products-browser/operation-pin.spec.ts |

- A proteção é configurada em Segurança. A senha é separada da senha de login,
  aplicada em cada mutação e exigida também do proprietário. A consulta de
  produtos e estoque mantém o fluxo existente.
- A criação e toda troca exigem novo código de e-mail, em diálogo antes dos
  campos da nova senha. Código incorreto, expirado ou já utilizado não libera
  a etapa de criação; autorização vencida oferece reinício da confirmação.
- Membros sem autorização de proprietário veem o estado e a explicação, sem
  ação de configuração. A API aplica a mesma regra.
- Falhas ficam junto ao formulário. Envio pendente bloqueia fechamento e ações
  repetidas; cancelamento descarta código, senha e autorização da memória da UI.
- A senha é solicitada ao enviar uma alteração, sem duplicar o pedido de senha
  de login na abertura do editor de produto ou estoque. O barramento diferencia
  o PIN de seis números das confirmações legadas que ainda usam senha de login.
- Essas mutações exigem conexão e não entram na fila offline. Leituras de
  catálogo seguem disponíveis para os fluxos existentes de venda offline.

## LP e promoções

Fonte: pedido do proprietário de 23/11/2026 e MarketingService / SubscriptionsService.

| Capability | Canonical owner | Source of truth | Allowed variants | Verification |
|---|---|---|---|---|
| Form | LandingConfigPanel + apiRequest | LandingConfigDto | editor e prévia | test/billing-browser/campaign.spec.ts |
| Select/Listbox | HTML select | DESIGN.md | native | tema original / Black Friday |
| Date | HTML input date | datas de campanha da API | native | início incluso / fim exclusivo |
| Modal | components/ui/ModalDialog.tsx | UX-CONTRACT.md | descartar rascunho | navegação entre abas |
| Promotion | MarketingService + snapshot SubscriptionPromotion | docs/billing.md do backend | Asaas / Paddle | marketing.service.spec.ts |

- Configuração persiste no servidor e só o admin do sistema pode alterá-la.
- Salvar é explícito. Falhas preservam o rascunho; retry é explícito. Não simular
  sucesso com localStorage. A prévia diferencia rascunho de página publicada.
- A aba usa `?tab=landing`. Trocar de aba com alterações exige ModalDialog;
  fechar ou recarregar usa beforeunload. Não ocultar erros apenas em toast.
- Datas usam meia-noite de Brasília. Término encerra novas adesões e não
  altera condições de assinaturas já contratadas.
- Oferta automática em planos pagos online, sem acumular cupom, uma vez por
  conta de cobrança; Free permanece grátis e Enterprise exige comercial.
- Preço original, preço com desconto, duração e preço posterior aparecem juntos.
  Os preços regionais vêm da API. Em falha de preço, orientar a conferir na contratação.
- Textos personalizados são compartilhados entre os idiomas e identificados
  assim no editor; os rótulos do produto seguem o catálogo ativo.

### Troca de layouts

- `lib/marketing.ts` mantém as identidades `standard`, `showcase`, `editorial`
  e `black-friday`; `LayoutThumbnail` representa as composições disponíveis.
- Os botões da galeria usam `aria-pressed`, foco visível e teclado nativo.
  Selecionar atualiza apenas o rascunho. Publicar grava o layout ativo e os textos
  de todos os layouts editados; voltar a outro layout recupera seus próprios textos.
- Título, descrição e botão são específicos de cada layout. Regras de desconto,
  ativação e datas pertencem à campanha e não mudam ao selecionar um layout.
  A ação explícita de preset Black Friday continua aplicando 50% por três meses.
- Rascunhos inéditos começam com textos prontos no idioma do admin. A migração
  preserva o texto atualmente publicado como primeiro perfil, sem trocar a LP no ar.
- Textos incompletos precisam ser corrigidos antes de trocar de layout. Falhas
  de gravação mantêm rascunhos; sair da aba continua usando o ModalDialog existente.
- Verificação: `lib/marketing.test.ts`, testes da API de marketing e
  `test/billing-browser/campaign.spec.ts` / `test/campaign-browser/landing.spec.ts`.
