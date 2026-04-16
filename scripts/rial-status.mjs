#!/usr/bin/env node
/**
 * rial-status.mjs
 *
 * Imprime un snapshot determinista del estado del repo RIAL.
 * Usado por:
 *  - `npm run rial:status` (humanos, CLI)
 *  - SessionStart hook en .claude/settings.json (agentes al abrir sesión)
 *
 * Cada bloque envuelto en try/catch para nunca fallar.
 * No requiere dependencias externas; solo Node 20+.
 */

import { execSync, spawnSync } from 'node:child_process';
import { readFileSync, existsSync, statSync, readdirSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(import.meta.url), '..', '..');

function safe(fn, fallback = 'n/a') {
  try {
    const out = fn();
    return out == null || out === '' ? fallback : out;
  } catch {
    return fallback;
  }
}

function git(args) {
  return execSync(`git ${args}`, {
    cwd: ROOT,
    stdio: ['ignore', 'pipe', 'ignore'],
    encoding: 'utf8',
  }).trim();
}

function hasRemote(name) {
  try {
    const remotes = git('remote');
    return remotes.split('\n').includes(name);
  } catch {
    return false;
  }
}

function bytesToHuman(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function dirSize(dir) {
  let total = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) total += dirSize(p);
    else total += statSync(p).size;
  }
  return total;
}

function lastSprintFromChangelog() {
  const path = join(ROOT, 'CHANGELOG.md');
  if (!existsSync(path)) return 'n/a';
  const text = readFileSync(path, 'utf8');
  const lines = text.split('\n');
  let currentVersion = null;
  for (const line of lines) {
    const ver = line.match(/^##\s+\[([^\]]+)\]/);
    if (ver) currentVersion = ver[1];
    const q = line.match(/Q(\d+)\s*[—–-]/);
    if (q && currentVersion) return `Q${q[1]} (${currentVersion})`;
  }
  return 'n/a';
}

function stateRisks() {
  const path = join(ROOT, 'docs', 'ai', 'state.md');
  if (!existsSync(path)) return ['n/a'];
  const text = readFileSync(path, 'utf8');
  const lines = text.split('\n');
  const idx = lines.findIndex((l) => /Current risks to watch/i.test(l));
  if (idx === -1) return ['n/a'];
  const out = [];
  for (let i = idx + 1; i < lines.length && out.length < 5; i += 1) {
    const l = lines[i].trim();
    if (l.startsWith('##')) break;
    if (l.startsWith('- ')) out.push(l.replace(/^-\s+/, ''));
  }
  return out.length ? out : ['no risks listed'];
}

function tsStatus() {
  const res = spawnSync('npx', ['tsc', '--noEmit'], {
    cwd: ROOT,
    encoding: 'utf8',
    shell: process.platform === 'win32',
  });
  if (res.status === 0) return 'OK';
  const errLines = (res.stdout || res.stderr || '').split('\n').filter((l) => / error TS/.test(l));
  return `${errLines.length} errors`;
}

function testsStatus() {
  const summary = join(ROOT, 'coverage', 'coverage-summary.json');
  if (existsSync(summary)) {
    try {
      const data = JSON.parse(readFileSync(summary, 'utf8'));
      const total = data.total;
      if (total?.lines) return `coverage ${total.lines.pct}% lines (last run)`;
    } catch {
      /* ignore */
    }
  }
  return 'run `npm test` to refresh';
}

function bundleSize() {
  const dist = join(ROOT, 'dist');
  if (!existsSync(dist)) return 'no dist — run `npm run build`';
  const size = safe(() => dirSize(dist), null);
  return size ? bytesToHuman(size) : 'n/a';
}

function remoteAheadBehind() {
  if (!hasRemote('rial-food')) return 'n/a (no rial-food remote)';
  return safe(() => {
    const out = git('rev-list --left-right --count rial-food/main...HEAD');
    const [behind, ahead] = out.split(/\s+/);
    return `ahead ${ahead}, behind ${behind} vs rial-food/main`;
  });
}

// --- OUTPUT ---
const now = new Date().toISOString();
const pkgPath = join(ROOT, 'package.json');
const version = safe(() => JSON.parse(readFileSync(pkgPath, 'utf8')).version, '?');

const lines = [
  `RIAL v${version} — status @ ${now}`,
  `Branch:        ${safe(() => git('rev-parse --abbrev-ref HEAD'))}`,
  `Last commit:   ${safe(() => git('log -1 --pretty=format:"%h %s (%cr)"'))}`,
  `Remote:        ${remoteAheadBehind()}`,
  `TypeScript:    ${safe(tsStatus)}`,
  `Tests:         ${safe(testsStatus)}`,
  `Build size:    ${safe(bundleSize)}`,
  `Last sprint:   ${safe(lastSprintFromChangelog)}`,
  `State gaps:`,
];

for (const r of stateRisks()) lines.push(`  - ${r}`);

process.stdout.write(lines.join('\n') + '\n');
