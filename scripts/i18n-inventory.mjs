#!/usr/bin/env node
/**
 * Inventário de textos potencialmente "hardcoded" (pt-BR) na interface.
 * Uso: node scripts/i18n-inventory.mjs > docs/i18n-inventory.md
 *
 * Heurística: strings em JSX/atributos visíveis (placeholder, title, aria-label,
 * label, description) e texto entre tags, com sinais de português (acentos ou
 * palavras típicas), ignorando className/style/imports/URLs.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const TARGETS = ["app", "components", "features", "lib"];
const IGNORE = [/node_modules/, /\.next/, /\.test\./, /messages\//];
const PT_SIGNAL = /[áàâãéêíóôõúçÁÀÂÃÉÊÍÓÔÕÚÇ]|\b(nenhum|nenhuma|cadastr|pesquis|salvar|cancelar|excluir|adicionar|voltar|fechar|cliente|produto|venda|caixa|estoque|fornecedor|relat|configura|movimenta|estoque)\w*/i;
const CONTEXT = /(?:placeholder|title|aria-label|label|description|alt)\s*=|>\s*[A-ZÁÉÍÓÚÂÊÔÃÕÇ][^<>{}\n]{3,}</;

function walk(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (IGNORE.some((pattern) => pattern.test(path))) continue;
    if (statSync(path).isDirectory()) walk(path, files);
    else if (/\.(tsx|jsx)$/.test(path)) files.push(path);
  }
  return files;
}

const counts = new Map();
const samples = new Map();
for (const target of TARGETS) {
  let files = [];
  try { files = walk(join(ROOT, target)); } catch { continue; }
  for (const file of files) {
    const lines = readFileSync(file, "utf8").split("\n");
    lines.forEach((line, index) => {
      if (/className|import |from "|https?:|\/\/|console\./.test(line)) return;
      if (!CONTEXT.test(line) || !PT_SIGNAL.test(line)) return;
      const moduleName = relative(ROOT, file).split(/[\\/]/)[0];
      counts.set(moduleName, (counts.get(moduleName) ?? 0) + 1);
      if (!samples.has(moduleName)) samples.set(moduleName, []);
      const bucket = samples.get(moduleName);
      if (bucket.length < 3) bucket.push(`${relative(ROOT, file)}:${index + 1} — ${line.trim().slice(0, 110)}`);
    });
  }
}

console.log("# Inventário de textos hardcoded (pt-BR)");
console.log("");
console.log("Gerado por `node scripts/i18n-inventory.mjs`. Cada linha é uma ocorrência **candidata** — revisar manualmente antes de migrar.");
console.log("");
console.log("| Módulo | Ocorrências candidatas |");
console.log("|---|---|");
for (const [name, count] of [...counts.entries()].sort((a, b) => b[1] - a[1])) console.log(`| ${name} | ${count} |`);
console.log("");
console.log(`**Total:** ${[...counts.values()].reduce((sum, value) => sum + value, 0)} candidatos em ${counts.size} módulo(s).`);
console.log("");
console.log("## Amostras");
for (const [name, bucket] of samples) {
  console.log("");
  console.log(`### ${name}`);
  for (const sample of bucket) console.log(`- ${sample}`);
}
