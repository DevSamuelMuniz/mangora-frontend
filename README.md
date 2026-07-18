# Gestão+ Frontend

Interface web do Gestão+, construída com Next.js App Router, React, TypeScript e Tailwind CSS.

## Configuração

Copie `.env.example` para `.env.local` e mantenha a URL da API alinhada ao backend:

```env
NEXT_PUBLIC_API_URL="http://localhost:3001/api"
API_URL="http://localhost:3001/api"
```

Comandos disponíveis:

```powershell
npm.cmd run dev
npm.cmd run lint
npx.cmd tsc --noEmit
npm.cmd run build
```

As rotas internas validam a sessão no backend antes da renderização. Login, cadastro e logout utilizam cookies `HttpOnly`; tokens não são armazenados no `localStorage`.
