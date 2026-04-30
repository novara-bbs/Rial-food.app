/**
 * OnboardingProgressSummary — chip row in the header.
 *
 * Locks: hidden when no chips, renders one span per non-empty field in order,
 * is `aria-hidden` (decorative — the step counter announces progress to SR).
 */
import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';

import { renderWithProviders } from '@/test/helpers/renderWithProviders';

import OnboardingProgressSummary from './OnboardingProgressSummary';

describe('OnboardingProgressSummary', () => {
  it('renders nothing when all fields are empty', () => {
    const { container } = renderWithProviders(
      <OnboardingProgressSummary data={{}} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders one chip per non-empty field, in declared order', () => {
    renderWithProviders(
      <OnboardingProgressSummary
        data={{
          goal: 'Build muscle',
          sex: 'Male',
          body: '75 kg · 175 cm',
        }}
      />,
    );
    // The chips are spans; verify all three labels are present and in order.
    expect(screen.getByText('Build muscle')).toBeInTheDocument();
    expect(screen.getByText('Male')).toBeInTheDocument();
    expect(screen.getByText('75 kg · 175 cm')).toBeInTheDocument();
  });

  it('marks the chip row as aria-hidden (decorative)', () => {
    const { container } = renderWithProviders(
      <OnboardingProgressSummary data={{ goal: 'Build muscle' }} />,
    );
    const wrapper = container.firstChild as HTMLElement | null;
    expect(wrapper).not.toBeNull();
    expect(wrapper?.getAttribute('aria-hidden')).toBe('true');
  });
});
