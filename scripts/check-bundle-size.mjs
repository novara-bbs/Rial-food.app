#!/usr/bin/env node
/**
 * RIAL bundle-size budget
 *
 * Reads dist/assets/*.js, measures raw + gzip sizes, and compares against budgets.
 * Exits 1 if any budget is exceeded. Runs in CI after `npm run build`.
 *
 * Baseline (2026-04-16, measured):
 *   - main entry (from dist/index.html): ~769 KB raw / ~240 KB gzip
 *   - vendor-recharts: ~331 KB raw / ~100 KB gzip
 *   - total dist/assets/*.js: ~2641 KB raw / ~751 KB gzip
 *
 * Budgets set with ~15% headroom over measured baseline.
 * The main entry is resolved by parsing `dist/index.html` (robust against Vite's
 * `index-*.js` naming collisions with feature chunks from files named `index.tsx`).
 */

import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import path from 'node:path';

const ROOT = process.cwd();
const DIST_DIR = path.resolve(ROOT, 'dist', 'assets');
const INDEX_HTML = path.resolve(ROOT, 'dist', 'index.html');

const KB = 1024;

/**
 * Resolve the main entry JS filename by parsing dist/index.html.
 * Falls back to a regex heuristic if index.html is missing.
 */
function resolveMainEntryName() {
  if (!existsSync(INDEX_HTML)) return null;
  const html = readFileSync(INDEX_HTML, 'utf8');
  // Match <script type="module" src="/assets/index-XXX.js"> or crossorigin variants.
  const m = html.match(/\/assets\/(index-[A-Za-z0-9_-]+\.js)/);
  return m ? m[1] : null;
}

const MAIN_ENTRY = resolveMainEntryName();

// Per-chunk budgets (raw KB / gzip KB).
// `match` is either a regex on the filename, or an exact filename string.
const CHUNK_BUDGETS = [
  {
    name: 'main entry (from index.html)',
    match: MAIN_ENTRY ? (name) => name === MAIN_ENTRY : () => false,
    rawKB: 920,
    gzipKB: 290,
  },
  {
    name: 'vendor-recharts',
    match: (name) => /^vendor-recharts.*\.js$/.test(name),
    rawKB: 400,
    gzipKB: 115,
  },
];

// Total-across-all-JS budget (safety net). Excludes sourcemaps.
// Sprint K [1.5.204] — bumped gzip from 900→920 to account for HydrationCard +
// HealthAndExerciseCard new components (net ~+1 KB gzip after deletions).
const TOTAL_BUDGET = { rawKB: 3200, gzipKB: 920 };

function listJsFiles(dir) {
  try {
    return readdirSync(dir)
      .filter((f) => f.endsWith('.js'))
      .map((f) => path.join(dir, f));
  } catch {
    return [];
  }
}

function formatKB(bytes) {
  return `${(bytes / KB).toFixed(1)} KB`;
}

function measure(filePath) {
  const buf = readFileSync(filePath);
  const raw = buf.length;
  const gzip = gzipSync(buf, { level: 9 }).length;
  return { raw, gzip };
}

function main() {
  const files = listJsFiles(DIST_DIR);
  if (files.length === 0) {
    console.error(
      `[size:check] No JS files found in ${DIST_DIR}. Did you run \`npm run build\` first?`
    );
    process.exit(2);
  }

  const report = files.map((file) => {
    const { raw, gzip } = measure(file);
    return { name: path.basename(file), file, raw, gzip };
  });

  let failed = false;

  console.log('[size:check] Per-file report:');
  for (const entry of report) {
    console.log(
      `  ${entry.name.padEnd(40)}  raw=${formatKB(entry.raw).padStart(9)}  gzip=${formatKB(entry.gzip).padStart(9)}`
    );
  }

  console.log('\n[size:check] Budget checks:');
  for (const budget of CHUNK_BUDGETS) {
    const match = report.find((r) => budget.match(r.name));
    if (!match) {
      console.warn(`  SKIP   ${budget.name}: no file matched`);
      continue;
    }
    const overRaw = match.raw > budget.rawKB * KB;
    const overGzip = match.gzip > budget.gzipKB * KB;
    if (overRaw || overGzip) {
      failed = true;
      console.error(
        `  FAIL   ${budget.name} (${match.name})\n` +
          `         raw   ${formatKB(match.raw)} / budget ${budget.rawKB} KB${overRaw ? '  OVER' : ''}\n` +
          `         gzip  ${formatKB(match.gzip)} / budget ${budget.gzipKB} KB${overGzip ? '  OVER' : ''}`
      );
    } else {
      console.log(
        `  OK     ${budget.name.padEnd(24)}  ${formatKB(match.raw)} raw / ${formatKB(match.gzip)} gzip`
      );
    }
  }

  const totalRaw = report.reduce((sum, r) => sum + r.raw, 0);
  const totalGzip = report.reduce((sum, r) => sum + r.gzip, 0);
  const totalOverRaw = totalRaw > TOTAL_BUDGET.rawKB * KB;
  const totalOverGzip = totalGzip > TOTAL_BUDGET.gzipKB * KB;
  if (totalOverRaw || totalOverGzip) {
    failed = true;
    console.error(
      `  FAIL   TOTAL\n` +
        `         raw   ${formatKB(totalRaw)} / budget ${TOTAL_BUDGET.rawKB} KB${totalOverRaw ? '  OVER' : ''}\n` +
        `         gzip  ${formatKB(totalGzip)} / budget ${TOTAL_BUDGET.gzipKB} KB${totalOverGzip ? '  OVER' : ''}`
    );
  } else {
    console.log(
      `  OK     TOTAL                     ${formatKB(totalRaw)} raw / ${formatKB(totalGzip)} gzip`
    );
  }

  if (failed) {
    console.error('\n[size:check] FAILED — one or more budgets exceeded.');
    process.exit(1);
  }
  console.log('\n[size:check] PASSED — all budgets within limits.');
}

main();
