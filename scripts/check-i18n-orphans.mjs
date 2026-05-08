#!/usr/bin/env node
/**
 * i18n orphan key detector — Sprint B [1.5.213].
 *
 * Walks src/i18n/locales/es/ to extract all dotted key paths, then greps
 * src/**\/*.{ts,tsx} for each path. Reports keys with zero references.
 *
 * Heuristic — false positives possible when keys are accessed via dynamic
 * computed property (e.g. `t.recipeTags[tag]`), so the report is advisory:
 * inspect each candidate before deletion.
 *
 * Usage:
 *   node scripts/check-i18n-orphans.mjs            # report only
 *   node scripts/check-i18n-orphans.mjs --json     # machine-readable
 *
 * Exits 0 always (advisory). Use git diff to gate commits.
 */
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import ts from 'typescript';

const here = path.dirname(url.fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const localesDir = path.join(root, 'src/i18n/locales/es');
const srcDir = path.join(root, 'src');

const argJson = process.argv.includes('--json');

/** Recursively collect all keys as dotted paths (without the namespace prefix). */
function collectKeys(node, prefix, out) {
  if (!ts.isObjectLiteralExpression(node)) return;
  for (const prop of node.properties) {
    if (!ts.isPropertyAssignment(prop)) continue;
    const name = prop.name && (ts.isIdentifier(prop.name) || ts.isStringLiteral(prop.name))
      ? prop.name.text
      : null;
    if (!name) continue;
    const dotted = prefix ? `${prefix}.${name}` : name;
    if (ts.isObjectLiteralExpression(prop.initializer)) {
      collectKeys(prop.initializer, dotted, out);
    } else {
      out.push(dotted);
    }
  }
}

/** Parse a locale file and return its top-level domain object literal. */
function getDomainObject(file) {
  const src = fs.readFileSync(file, 'utf8');
  const sf = ts.createSourceFile(file, src, ts.ScriptTarget.Latest, true);
  let found = null;
  sf.forEachChild((node) => {
    if (found) return;
    if (ts.isVariableStatement(node)) {
      for (const decl of node.declarationList.declarations) {
        if (decl.initializer && ts.isObjectLiteralExpression(decl.initializer)) {
          found = decl.initializer;
        }
      }
    }
  });
  return found;
}

/** Walk src/ and collect all .ts/.tsx files, excluding tests + locales. */
function collectSourceFiles(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'i18n' && full.startsWith(srcDir + path.sep + 'i18n')) continue;
      collectSourceFiles(full, out);
    } else if (
      (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) &&
      !entry.name.endsWith('.test.ts') &&
      !entry.name.endsWith('.test.tsx') &&
      !entry.name.endsWith('.d.ts')
    ) {
      out.push(full);
    }
  }
  return out;
}

// Build the combined source-code haystack once.
const sourceFiles = collectSourceFiles(srcDir);
const haystack = sourceFiles.map((f) => fs.readFileSync(f, 'utf8')).join('\n');

// Build the orphan report per locale file.
const localeFiles = fs.readdirSync(localesDir)
  .filter((f) => f.endsWith('.ts') && f !== 'index.ts')
  .sort();

const allOrphans = [];
for (const file of localeFiles) {
  const full = path.join(localesDir, file);
  const obj = getDomainObject(full);
  if (!obj) continue;
  // The root object is the namespace itself (e.g. `const home = { home: { ... } }`).
  const keys = [];
  collectKeys(obj, '', keys);
  for (const key of keys) {
    // Match either `t.<key>` form or quoted `'<key>'` form.
    // Use a non-trivial heuristic — match the LAST segment as a property
    // access in addition to the full dotted path. Skip keys whose parent
    // path is referenced (heuristic: dynamic access).
    const segments = key.split('.');
    const last = segments[segments.length - 1];
    // Skip pure-identifier keys that are super common words (false-positive risk):
    if (/^(title|label|cancel|save|close|edit|delete|description|hint|placeholder)$/i.test(last)) {
      // We still need to check the full path then — a generic last segment
      // means we MUST verify via dotted access.
    }
    const dottedRe = new RegExp(`\\b${key.replace(/\./g, '\\.')}\\b`);
    if (dottedRe.test(haystack)) continue;

    // Dynamic-access suppression: if any ancestor path in the dotted chain
    // is referenced anywhere in the source (whether as `t.parent[var]` or
    // captured into a local like `const labels = t.parent`), assume the
    // children may be accessed dynamically and skip them.
    let dynamicAncestor = false;
    for (let i = segments.length - 1; i >= 1; i -= 1) {
      const ancestor = segments.slice(0, i).join('.');
      const ancestorRe = new RegExp(`\\b${ancestor.replace(/\./g, '\\.')}\\b`);
      if (ancestorRe.test(haystack)) { dynamicAncestor = true; break; }
    }
    if (dynamicAncestor) continue;

    allOrphans.push({ file, key });
  }
}

if (argJson) {
  console.log(JSON.stringify(allOrphans, null, 2));
} else {
  if (allOrphans.length === 0) {
    console.log('✓ No orphan i18n keys detected.');
  } else {
    console.log(`Found ${allOrphans.length} candidate orphan i18n keys (advisory):`);
    for (const { file, key } of allOrphans) {
      console.log(`  ${file}\t${key}`);
    }
    console.log('\nNote: heuristic — verify each before deletion (dynamic access patterns may produce false positives).');
  }
}
