#!/usr/bin/env node
/**
 * Q16 codemod — rewrites `text-[Npx]` literals to the semantic token scale
 * defined in `src/index.css`. See `docs/adr/ADR-002-no-text-arbitrary-px.md`.
 *
 * Mapping (per `.claude/plans/revisa-el-recepi-card-crystalline-moore.md`):
 *   text-[8px]  -> text-micro   (10px — iOS-minimum cap badge size)
 *   text-[9px]  -> text-micro
 *   text-[10px] -> text-micro
 *   text-[11px] -> text-caption
 *
 * Safe assumption (audited 2026-04-17): every match in `src/**` lives inside
 * a JSX className string/template — zero false positives. AST overhead is
 * unjustified; a literal regex on the file body is equivalent and faster.
 *
 * Usage:
 *   node scripts/codemod/text-tokens.mjs            # dry-run, prints diff
 *   node scripts/codemod/text-tokens.mjs --write    # apply changes
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(process.cwd(), 'src');
const WRITE = process.argv.includes('--write');

const MAP = [
  { from: /text-\[8px\]/g, to: 'text-micro' },
  { from: /text-\[9px\]/g, to: 'text-micro' },
  { from: /text-\[10px\]/g, to: 'text-micro' },
  { from: /text-\[11px\]/g, to: 'text-caption' },
];

async function walk(dir) {
  const out = [];
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.git') continue;
      out.push(...(await walk(full)));
    } else if (/\.(tsx?|jsx?)$/.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

async function main() {
  const files = await walk(ROOT);
  let touched = 0;
  let totalReplacements = 0;

  for (const file of files) {
    const src = await fs.readFile(file, 'utf8');
    let next = src;
    let fileReplacements = 0;

    for (const { from, to } of MAP) {
      next = next.replace(from, (_match) => {
        fileReplacements++;
        totalReplacements++;
        return to;
      });
    }

    if (fileReplacements > 0) {
      touched++;
      const rel = path.relative(process.cwd(), file);
      console.log(`  ${WRITE ? 'write' : 'dry  '}  ${rel}  (${fileReplacements})`);
      if (WRITE) {
        await fs.writeFile(file, next, 'utf8');
      }
    }
  }

  console.log(
    `\n[text-tokens] ${WRITE ? 'wrote' : 'would write'} ${totalReplacements} replacements across ${touched} files.`,
  );
  if (!WRITE) console.log('[text-tokens] Re-run with --write to apply.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
