import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import ExerciseLogSheet from './ExerciseLogSheet';
import { I18nProvider } from '../../../i18n';
import type { ExerciseIntensity } from '../utils/exercise-intensity';
import type { ActivityProfile } from '../utils/activity-calories';

function mount(opts: {
  open?: boolean;
  currentIntensity?: ExerciseIntensity;
  currentMinutes?: number;
  profile?: ActivityProfile;
  onSelect?: (i: ExerciseIntensity, m: number) => void;
  onOpenChange?: (open: boolean) => void;
} = {}) {
  const onSelect = opts.onSelect ?? vi.fn();
  const onOpenChange = opts.onOpenChange ?? vi.fn();
  const utils = render(
    <I18nProvider>
      <ExerciseLogSheet
        open={opts.open ?? true}
        onOpenChange={onOpenChange}
        currentIntensity={opts.currentIntensity ?? 'none'}
        currentMinutes={opts.currentMinutes ?? 0}
        profile={opts.profile ?? { weight: 75, sex: 'male' }}
        onSelect={onSelect}
      />
    </I18nProvider>,
  );
  return { ...utils, onSelect, onOpenChange };
}

describe('ExerciseLogSheet', () => {
  it('renders 3 tier options when open', () => {
    const { getByTestId } = mount();
    expect(getByTestId('exercise-tier-moderate')).toBeTruthy();
    expect(getByTestId('exercise-tier-medium')).toBeTruthy();
    expect(getByTestId('exercise-tier-intense')).toBeTruthy();
  });

  it('does NOT render the Clear option when intensity=none', () => {
    const { queryByTestId } = mount({ currentIntensity: 'none' });
    expect(queryByTestId('exercise-tier-clear')).toBeNull();
  });

  it('renders the Clear option when an intensity is selected', () => {
    const { getByTestId } = mount({ currentIntensity: 'medium', currentMinutes: 30 });
    expect(getByTestId('exercise-tier-clear')).toBeTruthy();
  });

  it('marks the active tier with aria-pressed=true and data-active=true', () => {
    const { getByTestId } = mount({ currentIntensity: 'intense', currentMinutes: 45 });
    const intense = getByTestId('exercise-tier-intense');
    expect(intense.getAttribute('aria-pressed')).toBe('true');
    expect(intense.getAttribute('data-active')).toBe('true');
    const moderate = getByTestId('exercise-tier-moderate');
    expect(moderate.getAttribute('aria-pressed')).toBe('false');
  });

  it('Save button calls onSelect with picked tier + minutes and closes the sheet', () => {
    const onSelect = vi.fn();
    const onOpenChange = vi.fn();
    const { getByTestId } = mount({ onSelect, onOpenChange });
    fireEvent.click(getByTestId('exercise-tier-medium'));
    fireEvent.click(getByTestId('minutes-preset-45'));
    fireEvent.click(getByTestId('exercise-save-cta'));
    expect(onSelect).toHaveBeenCalledWith('medium', 45);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('Clear button calls onSelect("none", 0)', () => {
    const onSelect = vi.fn();
    const { getByTestId } = mount({ currentIntensity: 'medium', currentMinutes: 30, onSelect });
    fireEvent.click(getByTestId('exercise-tier-clear'));
    expect(onSelect).toHaveBeenCalledWith('none', 0);
  });

  it('renders MET labels (3 / 6 / 9) for each tier', () => {
    const { getByTestId } = mount();
    expect(getByTestId('exercise-tier-moderate').textContent).toContain('3 MET');
    expect(getByTestId('exercise-tier-medium').textContent).toContain('6 MET');
    expect(getByTestId('exercise-tier-intense').textContent).toContain('9 MET');
  });

  it('minutes stepper +/- changes the value', () => {
    const { getByTestId } = mount({ currentIntensity: 'medium', currentMinutes: 30 });
    expect(getByTestId('minutes-value').textContent).toBe('30');
    fireEvent.click(getByTestId('minutes-increment'));
    expect(getByTestId('minutes-value').textContent).toBe('35');
    fireEvent.click(getByTestId('minutes-decrement'));
    fireEvent.click(getByTestId('minutes-decrement'));
    expect(getByTestId('minutes-value').textContent).toBe('25');
  });

  it('clicking a minutes preset chip sets the value', () => {
    const { getByTestId } = mount({ currentMinutes: 30 });
    fireEvent.click(getByTestId('minutes-preset-90'));
    expect(getByTestId('minutes-value').textContent).toBe('90');
  });

  it('live kcal preview reflects intensity + minutes + profile', () => {
    const { getByTestId } = mount({
      currentIntensity: 'medium',
      currentMinutes: 30,
      profile: { weight: 75, sex: 'male' },
    });
    // 6 MET × 75 kg × 0.5 × 1 = 225
    expect(getByTestId('exercise-kcal-preview').textContent).toContain('225');
  });

  it('uses theme tokens — no hex hardcoded', () => {
    const { baseElement } = mount();
    const html = baseElement.innerHTML;
    expect(html).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
  });
});
