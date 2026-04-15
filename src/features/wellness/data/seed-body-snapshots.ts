import type { BodySnapshot } from '../../../types/wellness';

/**
 * SVG gradient placeholder as base64 data URI.
 * Used for seed photo previews — avoids shipping real bitmap images in the bundle.
 * Each call generates a different hue so timeline photos look varied.
 */
function svgPhotoPlaceholder(hue: number, label: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="hsl(${hue},55%,65%)"/>
        <stop offset="1" stop-color="hsl(${(hue + 30) % 360},55%,35%)"/>
      </linearGradient>
    </defs>
    <rect width="400" height="500" fill="url(#g)"/>
    <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle"
      font-family="sans-serif" font-size="28" font-weight="700" fill="rgba(255,255,255,0.85)">
      ${label}
    </text>
  </svg>`;
  // btoa of UTF-8 string — encode first
  const encoded = typeof window !== 'undefined' && window.btoa
    ? window.btoa(unescape(encodeURIComponent(svg)))
    : Buffer.from(svg, 'utf-8').toString('base64');
  return `data:image/svg+xml;base64,${encoded}`;
}

/** YYYY-MM-DD for N days ago (0 = today). */
function dateNDaysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

/**
 * 30-day fixture of progressively richer snapshots.
 * Weight drifts 78 kg → 74.5 kg over the month with realistic noise.
 * Distribution:
 *  - days 30–21 ago (10 days): only kg
 *  - days 20–11 ago (10 days): kg + photo
 *  - days 10–6 ago  (5 days):  kg + photo + waist measurement
 *  - days 5–1 ago   (5 days):  full snapshot (kg + photo + all measurements + note)
 */
export function generateBodySnapshotSeed(): BodySnapshot[] {
  const snapshots: BodySnapshot[] = [];

  const notes = [
    'Mañana, en ayunas',
    'Después de entrenar',
    'Semana buena, bajando grasa',
    'Post-cheat, retengo líquidos',
    'Estable, sintiéndome bien',
  ];

  for (let i = 30; i >= 1; i--) {
    const date = dateNDaysAgo(i);
    // Weight trend: 78 → 74.5 with daily noise ±0.4
    const base = 78 - ((30 - i) / 30) * 3.5;
    const noise = (Math.sin(i * 1.7) * 0.3) + (Math.cos(i * 0.9) * 0.15);
    const kg = +(base + noise).toFixed(1);

    const snap: BodySnapshot = { date, kg };

    // Days 20–11: add photo
    if (i >= 11 && i <= 20) {
      snap.photoUrl = svgPhotoPlaceholder((i * 24) % 360, `Día -${i}`);
    }
    // Days 10–6: photo + waist
    if (i >= 6 && i <= 10) {
      snap.photoUrl = svgPhotoPlaceholder((i * 24) % 360, `Día -${i}`);
      const waistBase = 92 - ((10 - i) / 4) * 3; // 92 → 89
      snap.measurements = {
        waistCm: +(waistBase + Math.sin(i) * 0.4).toFixed(1),
      };
    }
    // Days 5–1: full snapshot
    if (i >= 1 && i <= 5) {
      snap.photoUrl = svgPhotoPlaceholder((i * 24) % 360, `Día -${i}`);
      snap.measurements = {
        chestCm: +(102 + Math.sin(i) * 0.5).toFixed(1),
        waistCm: +(88.5 + Math.cos(i) * 0.3).toFixed(1),
        hipsCm: +(98 + Math.sin(i * 2) * 0.4).toFixed(1),
        bodyFatPct: +(16.5 - ((5 - i) / 5) * 0.8).toFixed(1),
      };
      snap.note = notes[i - 1];
    }

    snapshots.push(snap);
  }

  return snapshots;
}

/** Singleton — call `generateBodySnapshotSeed()` lazily to avoid regenerating on each import. */
export const BODY_SNAPSHOT_SEED = generateBodySnapshotSeed();

/**
 * Replace current weightHistory with seed data.
 * Use only when history is empty (dev-only CTA in Progress.tsx).
 */
export function seedBodySnapshots(
  setWeightHistory: (v: BodySnapshot[] | ((prev: BodySnapshot[]) => BodySnapshot[])) => void,
): void {
  setWeightHistory(BODY_SNAPSHOT_SEED);
}
