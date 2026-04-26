#!/usr/bin/env node
/**
 * i18n symmetry check — ADR-004.
 *
 * Parses src/i18n/locales/es.ts + en.ts as TypeScript source, collects the
 * dotted key tree from the default object literal, and diffs the two sets.
 *
 * Exits 1 when asymmetry is detected, logging the missing keys per locale.
 *
 * Why this exists beyond TypeScript's own checking:
 * - Structural asymmetries surface as a single, focused PR-friendly diff.
 * - Catches cases where `as Translations` assertions bypass strict checking.
 * - Runs in CI without needing a full tsc compilation pass.
 *
 * Run: `npm run check:i18n`
 */
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import ts from 'typescript';

const here = path.dirname(url.fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const localesDir = path.join(root, 'src/i18n/locales');

/**
 * Resolve the locale source: folder of domain files (post-Phase 2.4) or
 * legacy single file (pre-Phase 2.4). Prefers folder when both exist.
 * Returns array of file paths to parse.
 */
function resolveLocaleFiles(locale) {
  const folder = path.join(localesDir, locale);
  const file = path.join(localesDir, `${locale}.ts`);
  if (fs.existsSync(folder) && fs.statSync(folder).isDirectory()) {
    return fs.readdirSync(folder)
      .filter(f => f.endsWith('.ts') && f !== 'index.ts')
      .sort()
      .map(f => path.join(folder, f));
  }
  if (fs.existsSync(file)) return [file];
  throw new Error(`Locale ${locale} not found at ${folder} or ${file}`);
}

/**
 * Walks a TypeScript source file and returns the first object-literal
 * expression assigned to a top-level `const` variable. Works for both
 * `const es = { ... };` and `const en: Translations = { ... };`.
 */
function findRootObjectLiteral(sourceFile) {
  let found = null;
  sourceFile.forEachChild(node => {
    if (found) return;
    if (ts.isVariableStatement(node)) {
      for (const decl of node.declarationList.declarations) {
        if (decl.initializer && ts.isObjectLiteralExpression(decl.initializer)) {
          found = decl.initializer;
          return;
        }
      }
    }
  });
  return found;
}

/**
 * Recursively collects dotted paths for every leaf (string/number/boolean)
 * reached inside the object literal. Nested objects contribute `parent.child`
 * segments. Array literals are treated as leaves (position-specific, so we
 * collect the parent key once). Ignores spreads (none expected).
 */
function collectKeys(obj, prefix, out) {
  for (const prop of obj.properties) {
    if (!ts.isPropertyAssignment(prop)) continue;
    const name = prop.name;
    let key;
    if (ts.isIdentifier(name)) key = name.text;
    else if (ts.isStringLiteral(name) || ts.isNoSubstitutionTemplateLiteral(name)) key = name.text;
    else continue;
    const next = prefix ? `${prefix}.${key}` : key;
    const init = prop.initializer;
    if (ts.isObjectLiteralExpression(init)) {
      collectKeys(init, next, out);
    } else {
      // leaf: string / array / template / number / call — record as "has value"
      out.add(next);
    }
  }
}

function keysOf(filePath) {
  const src = fs.readFileSync(filePath, 'utf8');
  const sf = ts.createSourceFile(path.basename(filePath), src, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const root = findRootObjectLiteral(sf);
  if (!root) {
    throw new Error(`Could not find a root object literal in ${filePath}`);
  }
  const keys = new Set();
  collectKeys(root, '', keys);
  return keys;
}

/** Combine keys from all files belonging to a locale (post-split = many files; legacy = one). */
function keysOfLocale(locale) {
  const files = resolveLocaleFiles(locale);
  const merged = new Set();
  for (const f of files) {
    const partial = keysOf(f);
    for (const k of partial) merged.add(k);
  }
  return merged;
}

function diff(a, b) {
  const out = [];
  for (const k of a) if (!b.has(k)) out.push(k);
  return out.sort();
}

try {
  const es = keysOfLocale('es');
  const en = keysOfLocale('en');
  const missingInEn = diff(es, en);
  const missingInEs = diff(en, es);

  if (missingInEn.length === 0 && missingInEs.length === 0) {
    console.log(`✓ i18n symmetry OK — ${es.size} keys aligned across es ↔ en.`);
    process.exit(0);
  }

  console.error('✗ i18n asymmetry detected (ADR-004)\n');
  if (missingInEn.length) {
    console.error(`Keys in es.ts missing from en.ts (${missingInEn.length}):`);
    for (const k of missingInEn) console.error('  - ' + k);
    console.error('');
  }
  if (missingInEs.length) {
    console.error(`Keys in en.ts missing from es.ts (${missingInEs.length}):`);
    for (const k of missingInEs) console.error('  - ' + k);
    console.error('');
  }
  console.error('Add the missing keys to the sibling locale before merging.');
  console.error('See docs/DESIGN-SYSTEM.md § references + ADR-004.');
  process.exit(1);
} catch (err) {
  console.error('check-i18n-symmetry failed:', err.message);
  process.exit(2);
}
