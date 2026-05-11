/**
 * HomeQuickStats — Sprint E [1.5.219] Phase 4.
 *
 * Locks the tier-driven visibility contract after migrating from the
 * deprecated `mode: 'simple' | 'advanced'` prop to `tier: DetailTier`.
 *
 * Key invariants:
 * - Returns null for 'simple' tier (chip row hidden)
 * - Renders for 'standard' and 'advanced' tiers
 * - Renders null when there is no data regardless of tier
 */
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import HomeQuickStats from './HomeQuickStats';
import { I18nProvider } from '../../../i18n';
import type { DetailTier } from '../../../types/preferences';

const TIERS: DetailTier[] = ['simple', 'standard', 'advanced'];

function mount(tier: DetailTier, overrides: {
  weightDelta?: { value: number; unit: 'kg' | 'lb'; since: 'week' | 'month' };
  activityToday?: { minutes: number; isTrainingDay: boolean };
  insightCount?: number;
} = { weightDelta: { value: -1.5, unit: 'kg', since: 'week' } }) {
  return render(
    <I18nProvider>
      <HomeQuickStats
        tier={tier}
        weightDelta={overrides.weightDelta}
        activityToday={overrides.activityToday}
        insightCount={overrides.insightCount ?? 0}
        onNavigate={vi.fn()}
      />
    </I18nProvider>,
  );
}

describe('HomeQuickStats — tier visibility', () => {
  it('returns null for simple tier (nothing renders)', () => {
    const { container } = mount('simple');
    expect(container.firstChild).toBeNull();
  });

  it('renders chip row for standard tier', () => {
    const { getByTestId } = mount('standard');
    expect(getByTestId('home-quick-stats')).toBeDefined();
  });

  it('renders chip row for advanced tier', () => {
    const { getByTestId } = mount('advanced');
    expect(getByTestId('home-quick-stats')).toBeDefined();
  });
});

describe('HomeQuickStats — data-driven visibility', () => {
  it('returns null when there is no data even in advanced tier', () => {
    // No weightDelta, no activityToday (minutes=0), no insights
    const { container } = mount('advanced', {
      activityToday: { minutes: 0, isTrainingDay: false },
      insightCount: 0,
    });
    expect(container.firstChild).toBeNull();
  });

  it('renders when only weight delta is present', () => {
    const { getByTestId } = mount('standard', {
      weightDelta: { value: 0.8, unit: 'kg', since: 'month' },
    });
    expect(getByTestId('home-quick-stats')).toBeDefined();
  });

  it('renders when only activity data is present', () => {
    const { getByTestId } = mount('standard', {
      activityToday: { minutes: 45, isTrainingDay: true },
    });
    expect(getByTestId('home-quick-stats')).toBeDefined();
  });

  it('renders when only insight count is present', () => {
    const { getByTestId } = mount('standard', { insightCount: 3 });
    expect(getByTestId('home-quick-stats')).toBeDefined();
  });
});

describe('HomeQuickStats — weight chip display', () => {
  it('shows a negative delta with minus sign', () => {
    const { getByTestId } = mount('standard', {
      weightDelta: { value: -2.3, unit: 'kg', since: 'week' },
    });
    const nav = getByTestId('home-quick-stats');
    expect(nav.textContent).toContain('-2.3');
  });

  it('shows a positive delta with plus sign', () => {
    const { getByTestId } = mount('advanced', {
      weightDelta: { value: 0.5, unit: 'kg', since: 'week' },
    });
    const nav = getByTestId('home-quick-stats');
    expect(nav.textContent).toContain('+0.5');
  });
});

describe('HomeQuickStats — all tiers produce consistent typing', () => {
  it('accepts all valid DetailTier values without TypeScript error', () => {
    // This test mainly guards the compile-time type — if the prop type changes
    // to an incompatible shape, this test file will fail to compile.
    for (const tier of TIERS) {
      const { unmount } = mount(tier);
      unmount();
    }
  });
});
