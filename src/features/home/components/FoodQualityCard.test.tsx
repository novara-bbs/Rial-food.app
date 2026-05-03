import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import FoodQualityCard from './FoodQualityCard';
import { I18nProvider } from '../../../i18n';
import type { DailyQuality } from '../utils/daily-quality';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

function makeQuality(overrides: Partial<DailyQuality> = {}): DailyQuality {
  return {
    fiber:            { key: 'fiber',            value: 20,  target: 30, unit: 'g',   fillPct: 67, badge: 'in-progress', partial: false, direction: 'encourage' },
    sugar:            { key: 'sugar',            value: 18,  target: 50, unit: 'g',   fillPct: 36, badge: 'good',        partial: false, direction: 'limit'    },
    saturatedFat:     { key: 'saturatedFat',     value: 8,   target: 20, unit: 'g',   fillPct: 40, badge: 'good',        partial: false, direction: 'limit'    },
    salt:             { key: 'salt',             value: 2.1, target: 5,  unit: 'g',   fillPct: 42, badge: 'good',        partial: false, direction: 'limit'    },
    ultraProcessed:   { key: 'ultraProcessed',   value: 15,  target: 0,  unit: '%',   fillPct: 15, badge: 'good',        partial: false, direction: 'limit'    },
    fruitsVegetables: { key: 'fruitsVegetables', value: 2,   target: 5,  unit: 'svg', fillPct: 40, badge: 'low',         partial: false, direction: 'encourage'},
    coverageScore: 63,
    ...overrides,
  };
}

function mount(
  quality = makeQuality(),
  opts: { defaultExpanded?: boolean; onViewNutrition?: () => void } = {},
) {
  return render(
    <I18nProvider>
      <FoodQualityCard
        quality={quality}
        onViewNutrition={opts.onViewNutrition}
        defaultExpanded={opts.defaultExpanded}
      />
    </I18nProvider>,
  );
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('FoodQualityCard', () => {
  it('renders collapsed by default — metric rows hidden, score visible', () => {
    const { getByTestId, queryByTestId } = mount();
    expect(getByTestId('food-quality-card')).toBeTruthy();
    expect(getByTestId('quality-score-value').textContent).toBe('63');
    // Rows are in the DOM but the expandable section is opacity-0/max-h-0
    expect(queryByTestId('quality-row-fiber')).toBeTruthy(); // still in DOM
    expect(getByTestId('food-quality-toggle').getAttribute('aria-expanded')).toBe('false');
  });

  it('expands on toggle click and shows all 6 metric rows', () => {
    const { getByTestId, getAllByTestId } = mount();
    fireEvent.click(getByTestId('food-quality-toggle'));
    expect(getByTestId('food-quality-toggle').getAttribute('aria-expanded')).toBe('true');
    const rows = getAllByTestId(/^quality-row-/);
    expect(rows).toHaveLength(6);
  });

  it('renders with defaultExpanded=true already open', () => {
    const { getByTestId } = mount(makeQuality(), { defaultExpanded: true });
    expect(getByTestId('food-quality-toggle').getAttribute('aria-expanded')).toBe('true');
  });

  it('collapses again on second toggle click', () => {
    const { getByTestId } = mount(makeQuality(), { defaultExpanded: true });
    fireEvent.click(getByTestId('food-quality-toggle'));
    expect(getByTestId('food-quality-toggle').getAttribute('aria-expanded')).toBe('false');
  });

  it('renders all 6 metric row test-ids', () => {
    const { getByTestId } = mount(makeQuality(), { defaultExpanded: true });
    expect(getByTestId('quality-row-fiber')).toBeTruthy();
    expect(getByTestId('quality-row-sugar')).toBeTruthy();
    expect(getByTestId('quality-row-saturatedFat')).toBeTruthy();
    expect(getByTestId('quality-row-salt')).toBeTruthy();
    expect(getByTestId('quality-row-ultraProcessed')).toBeTruthy();
    expect(getByTestId('quality-row-fruitsVegetables')).toBeTruthy();
  });

  it('shows partial note when any metric has partial=true', () => {
    const withPartial = makeQuality({
      sugar: { ...makeQuality().sugar, partial: true, badge: 'partial-data' },
    });
    const { getByTestId } = mount(withPartial, { defaultExpanded: true });
    expect(getByTestId('quality-partial-note')).toBeTruthy();
  });

  it('does not show partial note when no metric is partial', () => {
    const { queryByTestId } = mount(makeQuality(), { defaultExpanded: true });
    expect(queryByTestId('quality-partial-note')).toBeNull();
  });

  it('calls onViewNutrition when CTA is clicked', () => {
    const onViewNutrition = vi.fn();
    const { getByTestId } = mount(makeQuality(), { defaultExpanded: true, onViewNutrition });
    fireEvent.click(getByTestId('view-nutrition-cta'));
    expect(onViewNutrition).toHaveBeenCalledOnce();
  });

  it('does not render CTA when onViewNutrition is absent', () => {
    const { queryByTestId } = mount(makeQuality(), { defaultExpanded: true });
    expect(queryByTestId('view-nutrition-cta')).toBeNull();
  });

  it('exposes data-anchor="quality" on the card container', () => {
    const { getByTestId } = mount();
    expect(getByTestId('food-quality-card').getAttribute('data-anchor')).toBe('quality');
  });

  it('score ring fill uses CSS variable for stroke, no hex colors', () => {
    const { container } = mount();
    const html = container.innerHTML;
    expect(html).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    expect(html).not.toContain('dark:');
    // Ring stroke must be a CSS variable (primary / tertiary / error depending on score).
    expect(html).toMatch(/var\(--color-(primary|tertiary|error)\)/);
    expect(html).toContain('--color-surface-container-highest');
  });

  it('score ring uses --color-primary for score >= 70', () => {
    const { getByTestId } = mount(makeQuality({ coverageScore: 75 }));
    const ring = getByTestId('quality-score-ring-fill');
    expect(ring.getAttribute('stroke')).toBe('var(--color-primary)');
  });

  it('score ring uses --color-tertiary for score 40-69', () => {
    const { getByTestId } = mount(makeQuality({ coverageScore: 63 }));
    const ring = getByTestId('quality-score-ring-fill');
    expect(ring.getAttribute('stroke')).toBe('var(--color-tertiary)');
  });

  it('score ring uses --color-error for score < 40', () => {
    const { getByTestId } = mount(makeQuality({ coverageScore: 20 }));
    const ring = getByTestId('quality-score-ring-fill');
    expect(ring.getAttribute('stroke')).toBe('var(--color-error)');
  });

  it('score ring dashoffset reflects coverage score', () => {
    const { getByTestId } = mount();
    const fill = getByTestId('quality-score-ring-fill');
    // dashoffset should be < circumference (score 63 means partial fill)
    const offset = parseFloat(fill.getAttribute('stroke-dashoffset') ?? '0');
    const array = parseFloat(fill.getAttribute('stroke-dasharray') ?? '0');
    expect(offset).toBeGreaterThan(0);      // not full
    expect(offset).toBeLessThan(array);     // not empty
  });

  // ─── Sprint G — PDF reference visual contract ───────────────────────────────

  it('Sprint I: body uses single-column stack (2-col grid caused label truncation + overflow)', () => {
    const { getByTestId } = mount(makeQuality(), { defaultExpanded: true });
    const grid = getByTestId('quality-metrics-grid');
    expect(grid.className).toContain('space-y-');
    expect(grid.className).not.toContain('grid-cols-2');
  });

  it('Sprint G: title is mixed-case (no overline / uppercase / tracking-widest)', () => {
    const { container } = mount();
    const heading = container.querySelector('h3[data-heading-level="h3"]');
    expect(heading).toBeTruthy();
    // Default Heading variant — no overline class chain.
    const cls = heading?.className ?? '';
    expect(cls).not.toContain('uppercase');
    expect(cls).not.toContain('tracking-widest');
  });

  it('Sprint G: CTA is centered (not justify-end)', () => {
    const onViewNutrition = vi.fn();
    const { getByTestId } = mount(makeQuality(), { defaultExpanded: true, onViewNutrition });
    const cta = getByTestId('view-nutrition-cta');
    expect(cta.className).toContain('justify-center');
    expect(cta.className).not.toContain('justify-end');
  });

  it('Sprint G: metric rows do NOT contain lucide-* icons or progress bars', () => {
    const { container } = mount(makeQuality(), { defaultExpanded: true });
    // Lucide icons render with class "lucide lucide-{name}" — none of the metric icons should render.
    const metricIcons = container.querySelectorAll(
      'svg.lucide-leaf, svg.lucide-candy, svg.lucide-droplet, svg.lucide-flask-conical, svg.lucide-package, svg.lucide-apple',
    );
    expect(metricIcons.length).toBe(0);
    // Mini progress bars used h-1.5 — should be absent.
    const bars = container.querySelectorAll('div.h-1\\.5');
    expect(bars.length).toBe(0);
  });
});
