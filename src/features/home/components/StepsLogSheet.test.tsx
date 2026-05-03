import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import StepsLogSheet from './StepsLogSheet';
import { I18nProvider } from '../../../i18n';
import type { ActivityProfile } from '../utils/activity-calories';

function mount(opts: {
  open?: boolean;
  currentSteps?: number;
  target?: number;
  profile?: ActivityProfile;
  onSelect?: (steps: number) => void;
  onOpenChange?: (open: boolean) => void;
} = {}) {
  const onSelect = opts.onSelect ?? vi.fn();
  const onOpenChange = opts.onOpenChange ?? vi.fn();
  const utils = render(
    <I18nProvider>
      <StepsLogSheet
        open={opts.open ?? true}
        onOpenChange={onOpenChange}
        currentSteps={opts.currentSteps ?? 0}
        target={opts.target ?? 10000}
        profile={opts.profile ?? { weight: 70, sex: 'male' }}
        onSelect={onSelect}
      />
    </I18nProvider>,
  );
  return { ...utils, onSelect, onOpenChange };
}

describe('StepsLogSheet', () => {
  it('renders the slider when open', () => {
    const { getByTestId } = mount({ open: true, currentSteps: 5000 });
    expect(getByTestId('steps-slider')).toBeTruthy();
  });

  it('shows current steps as initial slider value', () => {
    const { getByTestId } = mount({ currentSteps: 7500 });
    const slider = getByTestId('steps-slider') as HTMLInputElement;
    expect(slider.value).toBe('7500');
  });

  it('updates kcal preview when slider changes (live calc)', () => {
    const { getByTestId } = mount({
      currentSteps: 0,
      profile: { weight: 75, sex: 'male' },
    });
    const slider = getByTestId('steps-slider') as HTMLInputElement;
    fireEvent.change(slider, { target: { value: '10000' } });
    // 10000 × 0.0005 × 75 × 1 = 375
    expect(getByTestId('steps-kcal-preview').textContent).toContain('375');
  });

  it('clicking a preset chip updates the slider', () => {
    const { getByTestId } = mount({ currentSteps: 0 });
    fireEvent.click(getByTestId('steps-preset-10000'));
    const slider = getByTestId('steps-slider') as HTMLInputElement;
    expect(slider.value).toBe('10000');
  });

  it('save button calls onSelect with the draft value', () => {
    const onSelect = vi.fn();
    const { getByTestId } = mount({ currentSteps: 0, onSelect });
    fireEvent.click(getByTestId('steps-preset-15000'));
    fireEvent.click(getByTestId('steps-save-cta'));
    expect(onSelect).toHaveBeenCalledWith(15000);
  });

  it('cancel button does NOT call onSelect, just closes the sheet', () => {
    const onSelect = vi.fn();
    const onOpenChange = vi.fn();
    const { getByTestId } = mount({ currentSteps: 5000, onSelect, onOpenChange });
    fireEvent.click(getByTestId('steps-preset-15000')); // change draft
    fireEvent.click(getByTestId('steps-cancel-cta'));
    expect(onSelect).not.toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('female profile yields ~5% lower kcal than male of same weight', () => {
    const { getByTestId, rerender } = mount({
      currentSteps: 10000,
      profile: { weight: 70, sex: 'male' },
    });
    const maleKcalText = getByTestId('steps-kcal-preview').textContent ?? '';
    const maleKcal = parseInt(maleKcalText.match(/\d+/)?.[0] ?? '0', 10);

    rerender(
      <I18nProvider>
        <StepsLogSheet
          open
          onOpenChange={vi.fn()}
          currentSteps={10000}
          target={10000}
          profile={{ weight: 70, sex: 'female' }}
          onSelect={vi.fn()}
        />
      </I18nProvider>,
    );
    const femaleKcalText = getByTestId('steps-kcal-preview').textContent ?? '';
    const femaleKcal = parseInt(femaleKcalText.match(/\d+/)?.[0] ?? '0', 10);

    expect(maleKcal).toBe(350); // 10000 × 0.0005 × 70 × 1 = 350
    expect(femaleKcal).toBe(333); // 350 × 0.95 = 332.5 → round 333
  });

  it('default profile (no weight) uses 70 kg fallback', () => {
    const { getByTestId } = mount({
      currentSteps: 10000,
      profile: {},
    });
    // 10000 × 0.0005 × 70 × 1 = 350
    expect(getByTestId('steps-kcal-preview').textContent).toContain('350');
  });
});
