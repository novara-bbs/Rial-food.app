import type { StoredRealFeelEntry } from '../../../types/wellness';

/** Calculate Real Score (vitality 0-100) and trend from RealFeel logs.
 *  Entries without a valid level (1-5) are excluded from averages. */
export function calcVitality(realFeelLogs: StoredRealFeelEntry[]): { avgVitality: number; trend: 'up' | 'down' | 'flat'; entryCount: number } {
  const logs = realFeelLogs || [];

  const validRecent = logs.slice(0, 7).filter(l => l.level != null && l.level >= 1);
  const avgVitality = validRecent.length > 0
    ? Math.round((validRecent.reduce((s, l) => s + l.level, 0) / validRecent.length) * 20)
    : 0;

  const validPrev = logs.slice(7, 14).filter(l => l.level != null && l.level >= 1);
  const prevAvg = validPrev.length > 0
    ? Math.round((validPrev.reduce((s, l) => s + l.level, 0) / validPrev.length) * 20)
    : 0;

  let trend: 'up' | 'down' | 'flat' = 'flat';
  if (validRecent.length > 0 && validPrev.length > 0) {
    // Standard 2-window comparison
    trend = avgVitality > prevAvg + 5 ? 'up' : avgVitality < prevAvg - 5 ? 'down' : 'flat';
  } else if (validRecent.length >= 4 && validPrev.length === 0) {
    // Intra-set trend: split the available entries into halves
    const mid = Math.floor(validRecent.length / 2);
    const olderHalf = validRecent.slice(mid); // logs are newest-first → tail is older
    const newerHalf = validRecent.slice(0, mid);
    const olderAvg = Math.round((olderHalf.reduce((s, l) => s + l.level, 0) / olderHalf.length) * 20);
    const newerAvg = Math.round((newerHalf.reduce((s, l) => s + l.level, 0) / newerHalf.length) * 20);
    trend = newerAvg > olderAvg + 5 ? 'up' : newerAvg < olderAvg - 5 ? 'down' : 'flat';
  }

  return { avgVitality, trend, entryCount: validRecent.length };
}
