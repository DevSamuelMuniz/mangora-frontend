# Mangora Frontend

Interface web da Mangora, construída com Next.js App Router, React, TypeScript e Tailwind CSS.

## Configuração

Na Vercel, configure a URL HTTPS da API hospedada no Render. Para executar o frontend nesta cópia, use o mesmo valor em `.env.local`:

```env
API_URL="https://api.mangora.com.br/api"
```

Comandos disponíveis:

```powershell
npm.cmd run dev
npm.cmd run lint
npx.cmd tsc --noEmit
npm.cmd run build
```

As rotas internas validam a sessão no backend antes da renderização. Login, cadastro e logout utilizam cookies `HttpOnly`; tokens não são armazenados no `localStorage`.

O frontend não possui fallback para API local. A Vercel usa o framework Next.js e o comando `npm run build`. As credenciais do Neon ficam somente no Render; não devem ser copiadas para o frontend.

Para preservar a identidade de IP através do proxy, configure na Vercel a variável
de servidor `FRONTEND_PROXY_SECRET`, com o mesmo valor aleatório (mínimo de 32
caracteres) no Render. Publique ambos os serviços. A variável não deve ter prefixo
`NEXT_PUBLIC_`. O frontend assina o IP observado pela borda da Vercel para chamadas
do navegador, carregamento de sessão e consultas de servidor; a API valida a
assinatura antes de usar esse IP no rate limit. Sem essa configuração, a API
continua usando seu IP de transporte, que pode agrupar usuários atrás do proxy.

O proxy diferencia páginas HTML de proteção da hospedagem (`UPSTREAM_PROTECTION`,
503) de limites reais da aplicação (429 com `Retry-After`). O cliente mostra o
prazo de espera fornecido pela API e não repete automaticamente envios de senha.
Os detalhes de instalação e diagnóstico estão no README do backend, na seção
“Login, proxies e limite de tentativas”.
