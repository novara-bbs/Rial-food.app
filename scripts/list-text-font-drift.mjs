#!/usr/bin/env node
/**
 * Scans src/**\/*.{tsx,jsx} for class strings that combine a Tailwind default
 * text-size (text-{xs..4xl}) with a font-weight (font-{medium|semibold|bold
 * |black}). Used to build the allowlist for the ESLint rule
 * `preferSemanticTextToken` (ADR-012). Not wired to CI — run on demand.
 */
import fs from 'node:fs';
import path from 'node:path';

const SIZE = /text-(xs|sm|base|lg|xl|2xl|3xl|4xl)\b/;
const WEIGHT = /font-(medium|semibold|bold|black)\b/;

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (/\.(tsx|jsx)$/.test(entry.name)) out.push(full);
  }
  return out;
}

const root = path.resolve(process.cwd(), 'src');
const files = walk(root).filter(
  (f) => !f.includes(path.join('test', 'conventions')),
);
const hits = new Set();
for (const f of files) {
  const t = fs.readFileSync(f, 'utf8');
  const ms = t.match(/['"`]([^'"`\n]+)['"`]/g) || [];
  for (const m of ms) {
    if (SIZE.test(m) && WEIGHT.test(m)) {
      hits.add(f.split(path.sep).join('/'));
      break;
    }
  }
}

const sorted = [...hits].sort();
for (const f of sorted) console.log(f);
console.log('---');
console.log(`Total: ${sorted.length}`);
