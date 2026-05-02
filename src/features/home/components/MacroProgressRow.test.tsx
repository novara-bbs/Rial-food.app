/**
 * Tests for MacroProgressRow — post-1.5.186 primitive.
 * Locks:
 *   - Computes the percentage from consumed/target.
 *   - Caps the bar fill at 100% even when consumed > target.
 *   - Renders consumed/target absolutes with the unit suffix.
 *   - Guards target=0 (returns 0% without dividing).
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MacroProgressRow from './MacroProgressRow';

describe('MacroProgressRow', () => {
  it('renders label + percent + absolutes', () => {
    render(
      <MacroProgressRow label="Carbs" consumed={50} target={100} colorClassName="bg-macro-carbs" />,
    );
    expect(screen.getByText('Carbs')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
    expect(screen.getByText('50/100g')).toBeInTheDocument();
  });

  it('caps bar width at 100% when consumed exceeds target', () => {
    const { container } = render(
      <MacroProgressRow label="Protein" consumed={200} target={100} colorClassName="bg-macro-protein" />,
    );
    const fill = container.querySelector('.bg-macro-protein') as HTMLElement;
    expect(fill.style.width).toBe('100%');
    // Percent text still reports the actual ratio.
    expect(screen.getByText('200%')).toBeInTheDocument();
  });

  it('returns 0% when target is 0 (avoids division-by-zero)', () => {
    render(
      <MacroProgressRow label="Fiber" consumed={5} target={0} colorClassName="bg-macro-fiber" />,
    );
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('honors custom unit suffix', () => {
    render(
      <MacroProgressRow
        label="Sodium"
        consumed={1500}
        target={2300}
        colorClassName="bg-macro-fats"
        unit="mg"
      />,
    );
    expect(screen.getByText('1500/2300mg')).toBeInTheDocument();
  });

  it('hides percent when showPercent is false', () => {
    render(
      <MacroProgressRow
        label="Carbs"
        consumed={50}
        target={100}
        colorClassName="bg-macro-carbs"
        showPercent={false}
      />,
    );
    expect(screen.queryByText('50%')).toBeNull();
    // Absolute label still rendered.
    expect(screen.getByText('50/100g')).toBeInTheDocument();
  });
});
