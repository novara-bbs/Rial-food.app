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
 * Planned: Supabase Storage bucket migration in Q11.
 */
export interface BodySnapshot {
  date: string;          // YYYY-MM-DD
  kg: number;
  note?: string;
  photoUrl?: string;     // base64 JPEG; undefined = no photo
  measurements?: BodyMeasurements;
}

/**
 * WeightEntry is kept as a backward-compat alias.
 * Prefer BodySnapshot for new code; WeightEntry alias will be removed in Q12+.
 */
export type WeightEntry = BodySnapshot;

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
