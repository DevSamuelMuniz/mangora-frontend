// Local, credential-free backend for the actual Next.js public landing page.
import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { resolve } from "node:path";
let theme = "black-friday";
const server = createServer((request, response) => {
  response.setHeader("Content-Type", "application/json");
  if (request.url === "/test/standard") { theme = "standard"; return response.end("{}"); }
  if (request.url?.startsWith("/test/layout/")) {
    const next = request.url.split("/").at(-1);
    if (!["standard", "showcase", "editorial", "black-friday"].includes(next)) { response.statusCode = 400; return response.end("{}"); }
    theme = next; return response.end("{}");
  }
  response.end(JSON.stringify({ theme, promotionEnabled: true, promotionActive: true, headline: "Sua loja no próximo nível. Pela metade do preço.", description: "PDV, estoque e financeiro juntos. Aproveite a Black Friday Mangora e organize sua loja com mais economia.", ctaLabel: "Quero aproveitar", discountPercent: 50, discountMonths: 3, startsAt: null, endsAt: null }));
});
server.listen(4181, "127.0.0.1");
const next = spawn(process.execPath, [resolve("node_modules/next/dist/bin/next"), "start", "-p", "4182"], { stdio: "inherit", env: { ...process.env, API_URL: "http://127.0.0.1:4181/api" }, windowsHide: true });
function stop() { next.kill(); server.close(); }
process.on("SIGINT", stop); process.on("SIGTERM", stop); next.on("exit", code => { server.close(); process.exit(code ?? 0); });
