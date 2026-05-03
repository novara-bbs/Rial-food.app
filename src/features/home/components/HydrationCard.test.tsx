import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import HydrationCard from './HydrationCard';
import { I18nProvider } from '../../../i18n';

function mount(opts: {
  consumed?: number;
  target?: number;
  onIncrement?: () => void;
  onDecrement?: () => void;
  onTargetChange?: (n: number) => void;
  disabled?: boolean;
} = {}) {
  const onIncrement = opts.onIncrement ?? vi.fn();
  const onDecrement = opts.onDecrement ?? vi.fn();
  const utils = render(
    <I18nProvider>
      <HydrationCard
        consumed={opts.consumed ?? 3}
        target={opts.target ?? 8}
        onIncrement={onIncrement}
        onDecrement={onDecrement}
        onTargetChange={opts.onTargetChange}
        disabled={opts.disabled}
      />
    </I18nProvider>,
  );
  return { ...utils, onIncrement, onDecrement };
}

describe('HydrationCard', () => {
  it('renders the correct cup count in the label', () => {
    const { getByTestId } = mount({ consumed: 3, target: 8 });
    expect(getByTestId('hydration-count').textContent).toContain('3');
    expect(getByTestId('hydration-count').textContent).toContain('8');
  });

  it('renders the correct number of glass icons', () => {
    const { getByTestId } = mount({ consumed: 2, target: 6 });
    const glasses = getByTestId('hydration-glasses');
    const svgs = glasses.querySelectorAll('svg');
    expect(svgs.length).toBe(6);
  });

  it('calls onIncrement when + is clicked', () => {
    const { getByTestId, onIncrement } = mount({ consumed: 3, target: 8 });
    fireEvent.click(getByTestId('hydration-increment'));
    expect(onIncrement).toHaveBeenCalledOnce();
  });

  it('calls onDecrement when − is clicked', () => {
    const { getByTestId, onDecrement } = mount({ consumed: 3, target: 8 });
    fireEvent.click(getByTestId('hydration-decrement'));
    expect(onDecrement).toHaveBeenCalledOnce();
  });

  it('disables − button when consumed is 0', () => {
    const { getByTestId } = mount({ consumed: 0, target: 8 });
    expect(getByTestId('hydration-decrement')).toBeDisabled();
  });

  it('disables + button when consumed equals target', () => {
    const { getByTestId } = mount({ consumed: 8, target: 8 });
    expect(getByTestId('hydration-increment')).toBeDisabled();
  });

  it('shows edit button only when onTargetChange is provided and not disabled', () => {
    const { queryByTestId, rerender } = mount({ consumed: 3, target: 8 });
    expect(queryByTestId('hydration-edit-target')).toBeNull();

    rerender(
      <I18nProvider>
        <HydrationCard
          consumed={3}
          target={8}
          onIncrement={vi.fn()}
          onDecrement={vi.fn()}
          onTargetChange={vi.fn()}
        />
      </I18nProvider>,
    );
    expect(queryByTestId('hydration-edit-target')).toBeTruthy();
  });

  it('hides controls when disabled', () => {
    const { queryByTestId } = mount({ disabled: true });
    expect(queryByTestId('hydration-increment')).toBeNull();
    expect(queryByTestId('hydration-decrement')).toBeNull();
  });

  it('data-anchor="hydration" is present for scroll-spy', () => {
    const { getByTestId } = mount();
    expect(getByTestId('hydration-card').getAttribute('data-anchor')).toBe('hydration');
  });
});
