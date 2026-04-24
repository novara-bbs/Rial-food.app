/**
 * Bulk ingredient text parser — R7.1.
 *
 * Given a multi-line string like:
 *   "200g pasta\n2 huevos\n100ml leche"
 * Returns an array of ParsedIngredient with best-effort
 * quantity / unit / name extraction and a confidence score (0–1).
 *
 * No LLM, no dictionary lookup. Caller is responsible for
 * matching parsed names against the ingredient dictionary.
 */

export interface ParsedIngredient {
  raw: string;
  quantity?: number;
  unit?: string;
  name?: string;
  /**
   * 0–1 confidence.
   * ≥ 0.6 = reliable enough to auto-add.
   * < 0.6  = flag for manual review.
   */
  confidence: number;
}

// ---------------------------------------------------------------------------
// Unit vocabulary (ES + EN variants, compiled once)
// ---------------------------------------------------------------------------

const UNIT_VOCAB = [
  // weight
  'kg', 'g', 'gr', 'grs', 'mg',
  // volume
  'l', 'ml', 'dl', 'cl',
  // imperial
  'oz', 'lb', 'lbs',
  // spoons / cups
  'tbsp', 'tsp',
  'cucharadas?\\s*(?:soperas?)?', 'cucharaditas?',
  'cdtas?', 'cdas?',
  'tazas?', 'cups?',
  // count / shape
  'unidades?', 'piezas?', 'u',
  'rebanadas?', 'filetes?', 'dientes?',
  'ramitas?', 'hojas?', 'cogollos?',
  'latas?', 'botes?', 'bolsas?', 'paquetes?',
  // imprecise
  'pizca', 'pellizco', 'puñado', 'chorrito',
  'pinch', 'handful', 'dash',
].join('|');

// "200g pasta" or "200 g pasta" (with optional "de" article)
const UNIT_COMPACT_RE = new RegExp(
  `^(\\d+(?:[.,]\\d+)?)\\s*(${UNIT_VOCAB})\\s+(?:de\\s+)?(.+)$`,
  'i',
);

// "1/2 taza harina" — fraction with unit
const FRACTION_UNIT_RE = new RegExp(
  `^(\\d+)\\/(\\d+)\\s+(${UNIT_VOCAB})\\s+(?:de\\s+)?(.+)$`,
  'i',
);

// "1/2 cebolla" — fraction without unit
const FRACTION_RE = /^(\d+)\/(\d+)\s+(.+)$/;

// "3 huevos" — plain number + name (no unit)
const NUM_ONLY_RE = /^(\d+(?:[.,]\d+)?)\s+(.+)$/;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseNum(s: string): number {
  return parseFloat(s.replace(',', '.'));
}

// ---------------------------------------------------------------------------
// Core parsers
// ---------------------------------------------------------------------------

export function parseIngredientLine(line: string): ParsedIngredient {
  const raw = line.trim();
  if (!raw) return { raw, confidence: 0 };

  // "200g pasta" or "200 g de pasta" — unit known → high confidence
  const m1 = UNIT_COMPACT_RE.exec(raw);
  if (m1) {
    return {
      raw,
      quantity: parseNum(m1[1]),
      unit: m1[2].toLowerCase().replace(/\s+/g, ' ').trim(),
      name: m1[3].trim(),
      confidence: 0.85,
    };
  }

  // "1/2 taza harina" — fraction with unit
  const mfu = FRACTION_UNIT_RE.exec(raw);
  if (mfu) {
    return {
      raw,
      quantity: parseInt(mfu[1]) / parseInt(mfu[2]),
      unit: mfu[3].toLowerCase().trim(),
      name: mfu[4].trim(),
      confidence: 0.80,
    };
  }

  // "1/2 cebolla" — fraction, no unit
  const mf = FRACTION_RE.exec(raw);
  if (mf) {
    return {
      raw,
      quantity: parseInt(mf[1]) / parseInt(mf[2]),
      name: mf[3].trim(),
      confidence: 0.65,
    };
  }

  // "3 huevos" — number + name (no unit)
  const mn = NUM_ONLY_RE.exec(raw);
  if (mn) {
    return {
      raw,
      quantity: parseNum(mn[1]),
      name: mn[2].trim(),
      confidence: 0.70,
    };
  }

  // Bare text only ("pizca de sal", "al gusto") → low confidence
  return { raw, name: raw, confidence: 0.35 };
}

export function parseBulkIngredients(text: string): ParsedIngredient[] {
  return text
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0)
    .map(parseIngredientLine);
}

// ---------------------------------------------------------------------------
// Amount helpers (used by the caller to convert to grams)
// ---------------------------------------------------------------------------

/**
 * Convert a parsed quantity + unit to an approximate gram value.
 * Falls back to `defaultGrams` when the unit cannot be converted.
 */
export function toApproxGrams(
  quantity: number | undefined,
  unit: string | undefined,
  defaultGrams: number,
): number {
  if (!quantity) return defaultGrams;
  const u = (unit ?? '').toLowerCase().trim();
  if (u === 'g' || u === 'gr' || u === 'grs') return Math.round(quantity);
  if (u === 'kg') return Math.round(quantity * 1000);
  if (u === 'mg') return Math.round(quantity / 1000);
  if (u === 'ml') return Math.round(quantity); // 1 ml ≈ 1 g
  if (u === 'cl') return Math.round(quantity * 10);
  if (u === 'dl') return Math.round(quantity * 100);
  if (u === 'l') return Math.round(quantity * 1000);
  // For all other units (spoons, cups, pieces…) fall back to default serving
  return defaultGrams;
}
