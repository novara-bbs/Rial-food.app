#!/usr/bin/env node
/**
 * Scans src/**\/*.{tsx,jsx} for the union of two typography drift patterns:
 *   (a) raw `<h1..h4>` JSX elements (preferHeadingPrimitive target)
 *   (b) class strings combining text-{xs..4xl} + font-{medium|semibold|bold|black}
 *       (preferSemanticTextToken target)
 *
 * Emits a sorted list in ESLint-array literal form, ready to paste into
 * `eslint.config.mjs` as `typographyMigrationAllowlist`.
 */
import fs from 'node:fs';
import path from 'node:path';

const SIZE = /text-(xs|sm|base|lg|xl|2xl|3xl|4xl)\b/;
const WEIGHT = /font-(medium|semibold|bold|black)\b/;
const H_TAG = /<h[1-4][\s>]/;

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
const cwdSlash = process.cwd().split(path.sep).join('/') + '/';
const files = walk(root).filter(
  (f) => !f.includes(path.join('test', 'conventions')),
);

const hits = new Set();
for (const f of files) {
  const rel = f.split(path.sep).join('/').replace(cwdSlash, '');
  const t = fs.readFileSync(f, 'utf8');
  if (H_TAG.test(t)) {
    hits.add(rel);
    continue;
  }
  const ms = t.match(/['"`]([^'"`\n]+)['"`]/g) || [];
  for (const m of ms) {
    if (SIZE.test(m) && WEIGHT.test(m)) {
      hits.add(rel);
      break;
    }
  }
}

const sorted = [...hits].sort();
for (const f of sorted) console.log(`  '${f}',`);
console.log('---');
console.log(`Total: ${sorted.length}`);
