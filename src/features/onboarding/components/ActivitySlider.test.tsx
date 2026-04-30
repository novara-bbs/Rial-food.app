/**
 * ActivitySlider — drag selector for activity level.
 *
 * Locks: dynamic label reflects current level, slider value 0..3 maps to
 * sedentary/light/active/veryActive in order, and aria-valuetext announces
 * the localized label (not the raw number) for screen readers.
 */
import { describe, it, expect, vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';

import { renderWithProviders } from '@/test/helpers/renderWithProviders';

import ActivitySlider from './ActivitySlider';

describe('ActivitySlider', () => {
  it('renders the current level label + desc dynamically', () => {
    renderWithProviders(
      <ActivitySlider value="active" onChange={vi.fn()} ariaLabel="Activity" />,
    );
    // EN locale: "Active" appears in the dynamic header AND in the tick row;
    // assert presence (≥1) and that the desc matches the chosen level.
    expect(screen.getAllByText('Active').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/3.*5 workouts/i)).toBeInTheDocument();
  });

  it('maps slider position 0..3 to the matching ActivityLevel via onChange', () => {
    const onChange = vi.fn();
    renderWithProviders(
      <ActivitySlider value="sedentary" onChange={onChange} ariaLabel="Activity" />,
    );
    const slider = screen.getByRole('slider') as HTMLInputElement;
    // Position 2 → 'active'
    fireEvent.change(slider, { target: { value: '2' } });
    expect(onChange).toHaveBeenCalledWith('active');
    // Position 3 → 'veryActive'
    fireEvent.change(slider, { target: { value: '3' } });
    expect(onChange).toHaveBeenCalledWith('veryActive');
  });

  it('announces the localized label via aria-valuetext (not the index)', () => {
    renderWithProviders(
      <ActivitySlider value="light" onChange={vi.fn()} ariaLabel="Activity" />,
    );
    const slider = screen.getByRole('slider');
    expect(slider.getAttribute('aria-valuetext')).toBe('Light');
    expect(slider.getAttribute('aria-valuetext')).not.toBe('1');
  });
});
