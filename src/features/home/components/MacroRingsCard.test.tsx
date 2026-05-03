import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import MacroRingsCard from './MacroRingsCard';
import { I18nProvider } from '../../../i18n';

interface PartialMacros {
  consumed: { pro: number; carbs: number; fats: number };
  target: { pro: number; carbs: number; fats: number };
}

const sampleMacros: PartialMacros = {
  consumed: { pro: 144, carbs: 178, fats: 23 },
  target: { pro: 160, carbs: 180, fats: 65 },
};

function mount(macros: PartialMacros = sampleMacros) {
  return render(
    <I18nProvider>
      <MacroRingsCard dailyMacros={macros} />
    </I18nProvider>,
  );
}

describe('MacroRingsCard', () => {
  it('renders 3 rings in canonical order: carbs, protein, fats (fiber moved to FoodQualityCard)', () => {
    const { getAllByTestId } = mount();
    const rings = getAllByTestId(/^macro-ring-(carbs|protein|fats)$/);
    expect(rings).toHaveLength(3);
    expect(rings[0].getAttribute('data-testid')).toBe('macro-ring-carbs');
    expect(rings[1].getAttribute('data-testid')).toBe('macro-ring-protein');
    expect(rings[2].getAttribute('data-testid')).toBe('macro-ring-fats');
  });

  it('does not render a fiber ring (fiber lives in FoodQualityCard)', () => {
    const { queryByTestId } = mount();
    expect(queryByTestId('macro-ring-fiber')).toBeNull();
  });

  it('exposes data-anchor="macros" on the grid container by default', () => {
    const { getByTestId } = mount();
    expect(getByTestId('macro-rings-card').getAttribute('data-anchor')).toBe('macros');
  });

  it('renders the percent inside each ring', () => {
    const { getByTestId } = mount();
    expect(getByTestId('macro-ring-protein').textContent).toContain('90%');   // 144/160
    expect(getByTestId('macro-ring-carbs').textContent).toContain('99%');     // 178/180
    expect(getByTestId('macro-ring-fats').textContent).toContain('35%');      // 23/65
  });

  it('caps the ring at 100% even when consumed > target', () => {
    const over: PartialMacros = {
      consumed: { pro: 200, carbs: 180, fats: 23 },
      target: { pro: 160, carbs: 180, fats: 65 },
    };
    const { getByTestId } = mount(over);
    expect(getByTestId('macro-ring-protein').textContent).toContain('100%');
  });

  it('uses CSS variables (no hex hardcoded) and avoids dark: prefix', () => {
    const { container } = mount();
    const html = container.innerHTML;
    expect(html).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    expect(html).not.toContain('dark:');
    expect(html).toContain('--color-macro-protein');
    expect(html).toContain('--color-macro-carbs');
    expect(html).toContain('--color-macro-fats');
  });

  it('emits an aria-label on each ring with consumed/target/pct', () => {
    const { getByTestId } = mount();
    const protein = getByTestId('macro-ring-protein').querySelector('[role="img"]');
    expect(protein?.getAttribute('aria-label')).toContain('144');
    expect(protein?.getAttribute('aria-label')).toContain('160');
    expect(protein?.getAttribute('aria-label')).toContain('90%');
  });
});
