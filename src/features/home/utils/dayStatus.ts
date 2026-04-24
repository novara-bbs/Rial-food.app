export type DayStatus = 'ahead' | 'on-track' | 'behind' | 'over';

const TOLERANCE = 0.15;

export function computeDayStatus(
  consumed: number,
  target: number,
  now: Date = new Date(),
): DayStatus {
  if (target <= 0) return 'on-track';
  const consumedRatio = consumed / target;
  if (consumedRatio > 1) return 'over';

  const minutesIntoDay = now.getHours() * 60 + now.getMinutes();
  const dayFraction = minutesIntoDay / (24 * 60);

  if (consumedRatio > dayFraction + TOLERANCE) return 'ahead';
  if (consumedRatio < dayFraction - TOLERANCE) return 'behind';
  return 'on-track';
}
