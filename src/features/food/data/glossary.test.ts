/**
 * P10 `[1.5.67]` — glossary data integrity tests.
 *
 * - Every GLOSSARY entry refers to a real subcategory slug present in at
 *   least one FoodFamily. If a slug falls off the data side, the glossary
 *   entry becomes dead code.
 * - Every entry has ≥ 3 examples (the Dialog UX relies on a non-trivial chip
 *   list).
 * - Definitions must exist bilingually in both locales.
 */
import { describe, it, expect } from 'vitest';
import { GLOSSARY, getGlossaryEntry } from './glossary';
import { FOOD_FAMILIES } from './food-families';
import esLocale from '../../../i18n/locales/es';
import enLocale from '../../../i18n/locales/en';

describe('GLOSSARY', () => {
  const usedSubcategories = new Set(
    FOOD_FAMILIES.map(f => f.subcategory).filter((s): s is string => Boolean(s)),
  );

  it('covers the technical subcategories that need explanation', () => {
    // Owner's explicit list (P10 plan): crucíferas, solanáceas, alliums, etc.
    const required = [
      'cruciferas',
      'solanaceas',
      'alliums',
      'cucurbitaceas',
      'pseudocereales',
      'raices-tuberculos',
      'pescado-azul',
      'pescado-blanco',
      'grasas-lacteas',
      'mantecas-pastas',
    ];
    for (const slug of required) {
      expect(GLOSSARY[slug], `missing glossary entry for ${slug}`).toBeDefined();
    }
  });

  it('every entry references a real subcategory that FOOD_FAMILIES actually uses', () => {
    for (const slug of Object.keys(GLOSSARY)) {
      expect(usedSubcategories.has(slug), `dead glossary entry: ${slug}`).toBe(true);
    }
  });

  it('every entry has at least 3 examples', () => {
    for (const [slug, entry] of Object.entries(GLOSSARY)) {
      expect(entry.examples.length, `${slug} needs ≥3 examples`).toBeGreaterThanOrEqual(3);
    }
  });

  it('every slug has a bilingual definition (es + en) in i18n', () => {
    const esDefs = (esLocale.foodDictionary as unknown as {
      glossary: { definitions: Record<string, string> };
    }).glossary.definitions;
    const enDefs = (enLocale.foodDictionary as unknown as {
      glossary: { definitions: Record<string, string> };
    }).glossary.definitions;
    for (const slug of Object.keys(GLOSSARY)) {
      expect(esDefs[slug], `ES definition missing for ${slug}`).toBeTruthy();
      expect(enDefs[slug], `EN definition missing for ${slug}`).toBeTruthy();
      expect(esDefs[slug].length).toBeGreaterThan(20);
      expect(enDefs[slug].length).toBeGreaterThan(20);
    }
  });
});

describe('getGlossaryEntry', () => {
  it('returns the entry for a known slug', () => {
    const entry = getGlossaryEntry('cruciferas');
    expect(entry).toBeDefined();
    expect(entry?.examples).toContain('Brócoli');
  });

  it('returns undefined for a slug not in the glossary', () => {
    // Self-explanatory slugs don't appear in GLOSSARY (they don't need it).
    expect(getGlossaryEntry('yogur')).toBeUndefined();
    expect(getGlossaryEntry('leche')).toBeUndefined();
    expect(getGlossaryEntry('frutos-secos')).toBeUndefined();
  });
});
