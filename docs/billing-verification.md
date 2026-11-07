# Verificação da cobrança — 07/11/2026

## Resultado

- Builds de produção do frontend (Next) e backend (Nest/Prisma): aprovados.
- TypeScript de produção e ESLint dos arquivos alterados: aprovados; lint completo do backend aprovado.
- Suíte completa do backend: **249 testes aprovados em 44 arquivos**.
- O typecheck geral que inclui todos os testes do backend ainda encontra tipos de mocks antigos em employees/inventory/pricing/products/stock; o build de produção e os testes executáveis passam.
- Esquema Prisma: validado. A migração aditiva foi preparada, **sem aplicar ao banco**.
- Navegador: 8 cenários aprovados em Chrome desktop e viewport de celular. Exercita telas e hooks reais com um backend local simulado, sem enviar cobranças a provedores reais.
- Testes de componente/recuperação: aviso por ciclo, permissões de funcionário, confirmação pendente, proteção de fila offline e corte calculado pelo servidor.
- Suíte completa do frontend: **193 aprovados e 3 falhas anteriores à alteração**.

## Falhas gerais fora do fluxo de cobrança

1. `test/i18n-keys.test.ts`: `products.stock.reservedShort` é usada em ProductCatalog e falta no catálogo pt-BR.
2. `test/i18n.test.ts`: o catálogo es-ES/customers tem nove chaves de detalhes a menos que pt-BR.
3. `test/regional-provider.test.tsx`: I18nProvider utiliza useRouter, mas o teste não monta nem simula o App Router.

As três condições foram verificadas também nas versões `git show HEAD:<arquivo>`, sem editar esses arquivos. Os catálogos de cobrança foram alinhados nos quatro idiomas.

A auditoria estática premium geral está em `test/billing-premium-audit.json`: cinco achados em cadastro/login/recuperação de senha, fora das telas alteradas. Ela não substitui a cobertura de navegador.

## Reproduzir o navegador

Com dependências de desenvolvimento instaladas e Google Chrome disponível:

```
npm run test:billing-browser
```

`playwright.billing.config.ts` inicia apenas o fixture Vite local em 127.0.0.1:4175. Os snapshots e traces ficam em `test-results/` (ignorado pelo Git). São cobertos navegação, histórico separado, fatura/Pix, foco circular, Escape/restauração, falha do provedor e confirmação administrativa de cancelamento. A biblioteca Playwright foi adicionada somente às dependências de desenvolvimento.

Homologação com credenciais sandbox, publicação e migração do banco não foram realizadas por esta alteração.
