import { createServer } from "vite";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
const folder = fileURLToPath(new URL(".", import.meta.url));
const project = resolve(folder, "../..");
const server = await createServer({
  configFile: false, root: folder, esbuild: { jsx: "automatic" },
  resolve: { alias: [ { find: "next/navigation", replacement: resolve(folder, "../billing-browser/navigation.tsx") }, { find: "next/link", replacement: resolve(folder, "../billing-browser/link.tsx") }, { find: "@", replacement: project } ] },
  server: { host: "127.0.0.1", port: 4176, strictPort: true, fs: { allow: [project] } },
  plugins: [{ name: "labels-test-backend", configureServer(server) {
    server.middlewares.use((request, response, next) => {
      if (!request.url?.startsWith("/api/backend/products")) return next();
      response.setHeader("Content-Type", "application/json");
      response.end(JSON.stringify([
        { id: "coffee", name: "Café especial da fazenda 500 g", sku: "CAFE-001", barcode: "0012345678905", price: 19.9, itemType: "PRODUCT" },
        { id: "compact", name: "Chá de camomila", sku: "CHA-002", barcode: "001234", price: 9.5, itemType: "PRODUCT" }
      ]));
    });
  } }],
});
await server.listen();
