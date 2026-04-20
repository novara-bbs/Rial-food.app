#!/usr/bin/env node
/**
 * P8 `[1.5.65]` — Family content bootstrap generator (Gemini).
 *
 * Generates `longDescription` + `culinaryUses` + `substitutes` for every
 * FoodFamily that doesn't yet have curated content in `family-content.generated.ts`.
 * The output MERGES with the existing file (hand-crafted seed entries are
 * preserved) and is committed for admin review.
 *
 * Usage:
 *   npm run generate:family-content -- [--dry-run] [--family=fam_x] [--force]
 *
 *   --dry-run   Print the generated payload to stdout without writing.
 *   --family=X  Generate for a single family (debug). Can repeat.
 *   --force     Regenerate even if the family already has content (overwrites).
 *
 * Requires environment:
 *   VITE_GEMINI_API_KEY    Direct to Google Generative Language API. Local use.
 *   GEMINI_MODEL           Optional. Defaults to 'gemini-2.0-flash-exp'.
 *
 * Rate limit: 1 request per second (tight enough for gemini-flash free tier).
 * ~150 families = ~3-5 minutes end to end.
 *
 * Output shape asserted by the JSON schema embedded in the prompt; invalid
 * responses are logged and skipped (they don't kill the run).
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = resolve(__dirname, '..');

// ─── Args ──────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const force = args.includes('--force');
const targetFamilies = args
  .filter(a => a.startsWith('--family='))
  .map(a => a.slice('--family='.length));

// ─── Config ────────────────────────────────────────────────────────────

const API_KEY = process.env.VITE_GEMINI_API_KEY;
const MODEL = process.env.GEMINI_MODEL ?? 'gemini-2.0-flash-exp';
const RATE_LIMIT_MS = 1000;

if (!API_KEY) {
  console.error('❌  VITE_GEMINI_API_KEY is not set. Set it in your shell or .env.local.');
  process.exit(1);
}

// ─── Inputs (loaded via dynamic import at runtime) ─────────────────────

/**
 * We can't `import` TypeScript directly from a `.mjs` script without tsx/esbuild.
 * Instead we shell-call `npx tsx` to dump the FOOD_FAMILIES list as JSON.
 * To avoid that dependency, this script reads the source files as text and
 * parses out the family ids + names with a lightweight regex. Good enough for
 * a one-shot bootstrap generator; if this ever grows we migrate to tsx.
 */
function loadFamilies() {
  const path = resolve(REPO_ROOT, 'src/features/food/data/food-families.ts');
  const src = readFileSync(path, 'utf8');
  // FAMILY_META entries: "fam_chicken_breast: { name: 'Pechuga de pollo', nameEn: 'Chicken breast', category: 'proteins', ... }"
  const metaRe = /^\s*(fam_[a-z_]+):\s*\{[\s\S]*?category:\s*'([a-z_]+)'/gm;
  const out = [];
  let m;
  while ((m = metaRe.exec(src)) !== null) {
    out.push({ id: m[1], category: m[2] });
  }
  return out;
}

function loadExistingContent() {
  const path = resolve(REPO_ROOT, 'src/features/food/data/family-content.generated.ts');
  const src = readFileSync(path, 'utf8');
  // Quick + robust: find keys of the exported FAMILY_CONTENT object literal.
  const keysRe = /^\s*(fam_[a-z_]+):\s*\{/gm;
  const keys = new Set();
  let m;
  while ((m = keysRe.exec(src)) !== null) {
    keys.add(m[1]);
  }
  return keys;
}

// ─── Gemini call ───────────────────────────────────────────────────────

const SYSTEM_PROMPT = `Eres un experto en nutrición y gastronomía. Tu tarea es generar contenido educativo para una app de nutrición en español e inglés.

Para el alimento dado, produces EXACTAMENTE este JSON (sin prosa antes ni después):

{
  "longDescription": {
    "es": "120-180 palabras. Origen, perfil nutricional (macros relevantes), método de producción/cultivo, un dato curioso. Tono científico pero accesible a cualquier edad.",
    "en": "Same content translated to English, 120-180 words."
  },
  "culinaryUses": [5-8 slugs from the closed set: raw-salads, grilling, baking, roasting, stir-fry, stews-soups, smoothies, breakfast, snack, dessert, spread, dressing, batch-cooking, meal-prep, post-workout, pre-workout],
  "substitutes": [3-5 entries of shape { familyId: '<family-id>', reason: '<reason-slug>' }]
}

Reasons closed set: similar-macros, similar-flavor, cheaper, higher-protein, lower-cal, lactose-free, gluten-free, plant-based.

Substitutes MUST be chosen from the family id list provided in the user prompt.

Respond with ONLY the JSON object, no markdown code fences, no commentary.`;

async function generateForFamily(family, allFamilyIds) {
  const userPrompt = `Alimento: ${family.id} (categoría: ${family.category})

Lista de familyId disponibles para substitutes:
${allFamilyIds.join(', ')}

Genera el JSON.`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
      generationConfig: { temperature: 0.7, responseMimeType: 'application/json' },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini HTTP ${response.status}: ${errText.slice(0, 200)}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error(`Gemini returned empty content for ${family.id}`);

  return JSON.parse(text);
}

// ─── Serialiser ────────────────────────────────────────────────────────

function serialiseEntry(familyId, entry) {
  const usesArr = entry.culinaryUses.map(u => `'${u}'`).join(', ');
  const subsArr = entry.substitutes
    .map(s => `{ familyId: '${s.familyId}', reason: '${s.reason}' }`)
    .join(',\n      ');
  return `  ${familyId}: {
    longDescription: {
      es: ${JSON.stringify(entry.longDescription.es)},
      en: ${JSON.stringify(entry.longDescription.en)},
    },
    culinaryUses: [${usesArr}],
    substitutes: [
      ${subsArr},
    ],
  },`;
}

// ─── Main ──────────────────────────────────────────────────────────────

async function main() {
  const families = loadFamilies();
  const existing = loadExistingContent();

  let queue = families;
  if (targetFamilies.length > 0) {
    queue = queue.filter(f => targetFamilies.includes(f.id));
    if (queue.length === 0) {
      console.error(`❌  No families matched --family filters: ${targetFamilies.join(', ')}`);
      process.exit(1);
    }
  }
  if (!force) {
    queue = queue.filter(f => !existing.has(f.id));
  }

  console.log(`[generate-family-content] ${queue.length} families to process (${families.length} total, ${existing.size} already have content)`);
  if (queue.length === 0) {
    console.log('Nothing to do. Use --force to overwrite.');
    return;
  }

  const allFamilyIds = families.map(f => f.id);
  const newEntries = [];
  let failed = 0;

  for (const family of queue) {
    try {
      console.log(`  → ${family.id}…`);
      const entry = await generateForFamily(family, allFamilyIds);

      // Validate shape minimally.
      if (!entry?.longDescription?.es || !entry?.longDescription?.en) {
        throw new Error('missing longDescription.es/en');
      }
      if (!Array.isArray(entry.culinaryUses) || entry.culinaryUses.length < 3) {
        throw new Error('missing/short culinaryUses');
      }
      if (!Array.isArray(entry.substitutes) || entry.substitutes.length < 2) {
        throw new Error('missing/short substitutes');
      }

      newEntries.push({ id: family.id, entry });
      if (dryRun) {
        console.log(serialiseEntry(family.id, entry));
      }
    } catch (err) {
      console.error(`  ✗ ${family.id}: ${err.message}`);
      failed++;
    }
    await new Promise(r => setTimeout(r, RATE_LIMIT_MS));
  }

  if (dryRun) {
    console.log(`\n[dry-run] generated ${newEntries.length} entries, ${failed} failed`);
    return;
  }

  if (newEntries.length === 0) {
    console.log(`No new entries produced. ${failed} failed.`);
    return;
  }

  // Append new entries into family-content.generated.ts before the closing `};`.
  const path = resolve(REPO_ROOT, 'src/features/food/data/family-content.generated.ts');
  const src = readFileSync(path, 'utf8');

  const blob = newEntries.map(({ id, entry }) => serialiseEntry(id, entry)).join('\n\n');
  const closingRe = /\n\};\n\n\/\*\*\n \* Lookup helper/;
  if (!closingRe.test(src)) {
    console.error('❌  Could not locate FAMILY_CONTENT closing brace — file format changed?');
    process.exit(1);
  }
  const out = src.replace(closingRe, `\n\n${blob}\n};\n\n/**\n * Lookup helper`);
  writeFileSync(path, out, 'utf8');

  console.log(`\n✓ Wrote ${newEntries.length} new entries to family-content.generated.ts${failed ? ` (${failed} failed)` : ''}`);
  console.log('  → Run `npm run lint` + `npm run test` + commit after reviewing the diff.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
