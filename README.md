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
