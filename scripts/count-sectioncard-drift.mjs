#!/usr/bin/env node
/**
 * Ad-hoc drift measurement — mirrors src/test/conventions/sectioncard-usage.test.ts
 * regex. Prints per-file hit counts, grouped by feature. For Wave 2 Cocina audit.
 */
import fs from 'node:fs';
import path from 'node:path';

const SHAPE = /bg-surface-container-low[^"'`]*\bborder-outline-variant\/20[^"'`]*\brounded-sm/;

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (/\.(tsx?|mjs|jsx)$/.test(entry.name)) out.push(full);
  }
  return out;
}

const files = walk('src')
  .filter(f => !f.endsWith(path.join('components', 'SectionCard.tsx')))
  .filter(f => !f.includes(path.join('test', 'conventions')));

const hits = {};
let total = 0;
for (const file of files) {
  const text = fs.readFileSync(file, 'utf8');
  const g = new RegExp(SHAPE.source, 'g');
  let n = 0;
  while (g.exec(text) !== null) {
    n++;
    total++;
  }
  if (n > 0) hits[file.replace(/\\/g, '/')] = n;
}

const featureFilter = process.argv[2] ?? '';
const entries = Object.entries(hits)
  .filter(([k]) => (featureFilter ? k.includes(featureFilter) : true))
  .sort(([, a], [, b]) => b - a);

console.log(`\nSectionCard drift ${featureFilter ? `(filter: ${featureFilter})` : '(all)'}`);
console.log('─'.repeat(80));
entries.forEach(([k, v]) => console.log(`  ${String(v).padStart(3)}  ${k}`));
console.log('─'.repeat(80));
console.log(`  subtotal: ${entries.reduce((s, [, v]) => s + v, 0)}`);
console.log(`  GLOBAL total: ${total}`);
