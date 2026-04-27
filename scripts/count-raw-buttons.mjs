// One-shot script: count raw branded <button> per file in src/features/.
// Used to generate the baseline allowlist for button-adoption.test.ts.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const FEATURES_DIR = path.resolve(ROOT, 'src/features');
const RAW_BUTTON_REGEX = /<button[^>]*\bbg-(primary|brand-secondary|secondary)\b/g;

function* walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else if (entry.isFile() && /\.tsx$/.test(entry.name) && !entry.name.endsWith('.test.tsx')) yield full;
  }
}

const offenders = [];
for (const file of walk(FEATURES_DIR)) {
  const src = fs.readFileSync(file, 'utf8');
  const matches = src.match(RAW_BUTTON_REGEX);
  if (matches && matches.length > 0) {
    offenders.push({ rel: path.relative(FEATURES_DIR, file).split(path.sep).join('/'), count: matches.length });
  }
}
offenders.sort((a, b) => b.count - a.count || a.rel.localeCompare(b.rel));
console.log('Total files:', offenders.length);
console.log('Total raw branded buttons:', offenders.reduce((s, o) => s + o.count, 0));
console.log('---allowlist entries---');
for (const o of offenders) {
  console.log(`  '${o.rel}': { count: ${o.count}, reason: 'Q1 2026 baseline — migrate in subsequent sprint' },`);
}
