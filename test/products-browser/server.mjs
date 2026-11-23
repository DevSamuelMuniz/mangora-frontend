import { createServer } from "vite";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

const folder = fileURLToPath(new URL(".", import.meta.url));
const project = resolve(folder, "../..");
const server = await createServer({
  configFile: false, root: folder, esbuild: { jsx: "automatic" },
  resolve: { alias: [
    { find: "next/image", replacement: resolve(folder, "image.tsx") },
    { find: "next/link", replacement: resolve(folder, "../billing-browser/link.tsx") },
    { find: "next/navigation", replacement: resolve(folder, "../billing-browser/navigation.tsx") },
    { find: "@", replacement: project },
  ] },
  server: { host: "127.0.0.1", port: 4176, strictPort: true, fs: { allow: [project] } },
});
await server.listen();
