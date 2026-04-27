/**
 * Body measurements snapshot — Q10 data model.
 * Optional centimeter measurements captured alongside weight entries.
 */
export interface BodyMeasurements {
  chestCm?: number;
  waistCm?: number;
  hipsCm?: number;
  bodyFatPct?: number;
}

/**
 * BodySnapshot is the canonical type for all body-state records.
 * Replaces the old WeightEntry shape (additive — new fields are optional
 * so all existing localStorage data deserialises without migration).
 *
 * Storage: base64 inline in `photoUrl` for Q10.
 * Planned: Supabase Storage bucket migration in Q6.
 */
export interface BodySnapshot {
  date: string;          // YYYY-MM-DD
  kg: number;
  note?: string;
  photoUrl?: string;     // base64 JPEG; undefined = no photo
  measurements?: BodyMeasurements;
}

/**
 * Weekly reflection entry. Formalised from the inline shape used in
 * `src/features/wellness/screens/WeeklyCheckIn.tsx` to make seed data
 * and handlers type-safe.
 */
export interface WeeklyCheckInEntry {
  id: number;
  weekStart: string;        // ISO date (YYYY-MM-DD)
  workedWell: string;
  whatWasHard: string;
  focusNextWeek: string;
  avgVitality: number;      // 0–100
  mealsLogged: number;
  consistencyDays: number;
}

export interface DailyCheckIn {
  id: string;
  userId: string;
  date: string; // ISO string
  status: 'Optimal' | 'Stable' | 'Sluggish' | 'Recovering';
  sleep: number; // hours
  stress: number; // 1-100 scale or similar
  symptoms: string[];
}

export interface ToleranceLog {
  id: string;
  userId: string;
  date: string;
  food: string;
  reaction: 'Severe' | 'Moderate' | 'Mild';
  symptoms: string;
}

// ─── RealFeel ─────────────────────────────────────────────────────────────────

export type EnergySignal = 'high' | 'stable' | 'low';
export type DigestionSignal = 'clean' | 'sensitive' | 'bloated';
export type MindsetSignal = 'calm' | 'balanced' | 'stressed';

/**
 * A single RealFeel entry submitted after a meal or at any time.
 * Tracks subjective energy, digestion, mindset, and free-form tags.
 */
export interface RealFeelEntry {
  level: number;
  tags: string[];
  note?: string;
  energy?: EnergySignal;
  digestion?: DigestionSignal;
  mindset?: MindsetSignal;
}

/**
 * A persisted RealFeel entry (after storage by the wellness handler).
 * Extends RealFeelEntry with runtime-generated fields: id, date, and
 * correlated meal/ingredient references.
 */
export interface StoredRealFeelEntry extends RealFeelEntry {
  id: number;
  date: string;           // ISO timestamp
  mealIds: number[];      // DailyLogEntry IDs logged in the past 90 min
  ingredientIds: string[];// ingredient IDs from those meals
}
