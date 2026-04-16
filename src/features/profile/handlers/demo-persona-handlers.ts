/**
 * Demo persona loader — writes persona fixture data to localStorage
 * then triggers a hard reload so AppStateContext re-hydrates.
 *
 * Only used from Settings → Developer panel. Import is lazy so the
 * demo-personas data module stays out of the critical bundle path.
 */
import type { DemoPersona } from '../data/demo-personas';

const DEMO_KEYS = [
  'weightHistory',
  'nutritionHistory',
  'realFeelLogs',
  'weeklyCheckIns',
] as const;

export async function loadDemoPersona(id: DemoPersona['id']): Promise<void> {
  // Dynamic import keeps ~15 kB of fixture data out of the main chunk
  const { DEMO_PERSONAS } = await import('../data/demo-personas');
  const persona = DEMO_PERSONAS.find(p => p.id === id);
  if (!persona) return;

  localStorage.setItem('weightHistory', JSON.stringify(persona.weightHistory));
  localStorage.setItem('nutritionHistory', JSON.stringify(persona.nutritionHistory));
  localStorage.setItem('realFeelLogs', JSON.stringify(persona.realFeelLogs));
  localStorage.setItem('weeklyCheckIns', JSON.stringify(persona.weeklyCheckIns));

  // Merge with existing userProfile (preserve avatar, bio, etc.)
  const existing = JSON.parse(localStorage.getItem('userProfile') ?? '{}');
  localStorage.setItem('userProfile', JSON.stringify({
    ...existing,
    ...persona.userProfile,
  }));

  localStorage.setItem('dailyMacros', JSON.stringify({
    consumed: { cal: 0, pro: 0, carbs: 0, fats: 0 },
    target: persona.dailyMacros.target,
  }));

  // Hard reload so all hooks re-read from localStorage
  window.location.reload();
}

export function clearDemoData(): void {
  for (const key of DEMO_KEYS) {
    localStorage.removeItem(key);
  }
  window.location.reload();
}
