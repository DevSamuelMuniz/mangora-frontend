import { createServer } from "vite";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { overview, invoice, detail } from "./fixtures.mjs";
const folder = fileURLToPath(new URL(".", import.meta.url));
const project = resolve(folder, "../..");
const server = await createServer({
  configFile: false, root: folder, esbuild: { jsx: "automatic" },
  resolve: { alias: [ { find: "next/navigation", replacement: resolve(folder, "navigation.tsx") }, { find: "next/link", replacement: resolve(folder, "link.tsx") }, { find: "@", replacement: project } ] },
  server: { host: "127.0.0.1", port: 4175, strictPort: true, fs: { allow: [project] } },
  plugins: [{ name: "billing-test-backend", configureServer(server) {
    server.middlewares.use((request, response, next) => {
      if (!request.url?.startsWith("/api/backend/")) return next();
      response.setHeader("Content-Type", "application/json");
      const route = request.url.slice("/api/backend".length).split("?")[0];
      if (route === "/subscription") return response.end(JSON.stringify(overview));
      if (route === "/subscription/invoices") return response.end(JSON.stringify({ items: [invoice], total: 1, page: 1, pageSize: 20, summary: [{ currency: "BRL", status: "OVERDUE", amount: 129, count: 1 }] }));
      if (route === "/subscription/reconcile") return response.end(JSON.stringify(overview));
      if (route.includes("/invoice") || route.startsWith("/system-admin/payments/")) return response.end(JSON.stringify(detail));
      if (route === "/subscription/checkout" || route === "/subscription/cancel") return response.end(JSON.stringify({}));
      response.statusCode = 404; response.end(JSON.stringify({ message: "Test route not found" }));
    });
  } }],
});
await server.listen();
