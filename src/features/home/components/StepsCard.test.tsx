/**
 * StepsCard — Sprint K-fix7 [1.5.211].
 *
 * Locks the rendering contract of the steps-only card after the
 * HealthAndExerciseCard split. Steps progress, kcal preview, and the CTA
 * that opens the StepsLogSheet should still work as in the previous card.
 */
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import StepsCard from './StepsCard';
import { I18nProvider } from '../../../i18n';
import type { ActivityProfile } from '../utils/activity-calories';

function mount(opts: {
  movement?: { steps: number; target: number };
  onStepsChange?: (steps: number) => void;
  profile?: ActivityProfile;
  disabled?: boolean;
} = {}) {
  const onStepsChange = opts.onStepsChange ?? vi.fn();
  const utils = render(
    <I18nProvider>
      <StepsCard
        movement={opts.movement ?? { steps: 0, target: 10000 }}
        onStepsChange={onStepsChange}
        profile={opts.profile ?? { weight: 75, sex: 'male' }}
        disabled={opts.disabled}
      />
    </I18nProvider>,
  );
  return { ...utils, onStepsChange };
}

describe('StepsCard', () => {
  it('renders the steps card with default empty state', () => {
    const { getByTestId } = mount();
    expect(getByTestId('steps-card')).toBeTruthy();
    expect(getByTestId('steps-card-cta')).toBeTruthy();
    expect(getByTestId('steps-info-button')).toBeTruthy();
  });

  it('shows steps + target with locale formatting', () => {
    const { getByTestId } = mount({ movement: { steps: 5000, target: 10000 } });
    const card = getByTestId('steps-card');
    expect(card.textContent).toMatch(/5[.,]?000/);
    expect(card.textContent).toMatch(/10[.,]?000/);
  });

  it('CTA shows "Añadir" when no steps yet, "Editar" when steps logged', () => {
    const empty = mount({ movement: { steps: 0, target: 10000 } });
    expect(empty.getByTestId('steps-card-cta').textContent?.toLowerCase()).toMatch(/añadir|add/);
    empty.unmount();

    const populated = mount({ movement: { steps: 8000, target: 10000 } });
    expect(populated.getByTestId('steps-card-cta').textContent?.toLowerCase()).toMatch(/editar|edit/);
  });

  it('disabled prop prevents the sheet from opening', () => {
    const onStepsChange = vi.fn();
    const { getByTestId } = mount({ disabled: true, onStepsChange });
    fireEvent.click(getByTestId('steps-card-cta'));
    // Disabled CTA should not call the change handler since the sheet doesn't open
    expect(onStepsChange).not.toHaveBeenCalled();
  });

  it('shows kcal preview computed from steps × profile', () => {
    const { getByTestId } = mount({
      movement: { steps: 10000, target: 10000 },
      profile: { weight: 75, sex: 'male' },
    });
    const card = getByTestId('steps-card');
    // 10000 × 0.0005 × 75 × 1 = 375
    expect(card.textContent).toContain('375');
  });

  it('uses theme tokens only — no hex literals in component classNames', () => {
    const { container } = mount({ movement: { steps: 5000, target: 10000 } });
    expect(container.innerHTML).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
  });

  it('renders progressbar with correct ARIA values', () => {
    const { container } = mount({ movement: { steps: 7500, target: 10000 } });
    const progressbar = container.querySelector('[role="progressbar"]');
    expect(progressbar?.getAttribute('aria-valuenow')).toBe('7500');
    expect(progressbar?.getAttribute('aria-valuemax')).toBe('10000');
  });
});
