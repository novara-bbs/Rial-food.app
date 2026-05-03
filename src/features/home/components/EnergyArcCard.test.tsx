import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import EnergyArcCard from './EnergyArcCard';
import { I18nProvider } from '../../../i18n';

function mount(consumed: number, target: number) {
  return render(
    <I18nProvider>
      <EnergyArcCard dailyMacros={{ consumed: { cal: consumed }, target: { cal: target } }} />
    </I18nProvider>,
  );
}

describe('EnergyArcCard', () => {
  it('renders the kcal-restantes number as target − consumed', () => {
    const { getByTestId } = mount(695, 1850);
    expect(getByTestId('energy-arc-remaining').textContent).toBe('1155');
  });

  it('clamps remaining at 0 when consumed > target (no negatives)', () => {
    const { getByTestId } = mount(2000, 1500);
    expect(getByTestId('energy-arc-remaining').textContent).toBe('0');
  });

  it('renders the 3-col stats row with consumed / pct / target', () => {
    const { getByTestId } = mount(695, 1850);
    const stats = getByTestId('energy-arc-stats');
    expect(stats.textContent).toContain('695');
    expect(stats.textContent).toContain('38%');
    expect(stats.textContent).toContain('1850');
  });

  it('renders the SVG track always and the progress path only when consumed > 0', () => {
    const { getByTestId, queryByTestId } = mount(0, 1850);
    expect(getByTestId('energy-arc-svg')).toBeTruthy();
    expect(getByTestId('energy-arc-track')).toBeTruthy();
    expect(queryByTestId('energy-arc-progress')).toBeNull();
    expect(queryByTestId('energy-arc-needle')).toBeNull();
    expect(queryByTestId('energy-arc-needle-halo')).toBeNull();
    expect(queryByTestId('energy-arc-needle-ring')).toBeNull();
  });

  it('renders progress path + 3-layer needle (halo + ring + core) when consumed > 0', () => {
    const { getByTestId } = mount(500, 1850);
    expect(getByTestId('energy-arc-progress')).toBeTruthy();
    expect(getByTestId('energy-arc-needle-halo')).toBeTruthy();
    expect(getByTestId('energy-arc-needle-ring')).toBeTruthy();
    expect(getByTestId('energy-arc-needle')).toBeTruthy();
  });

  it('uses theme tokens for colours (no hex hardcoded)', () => {
    const { container } = mount(500, 1850);
    const html = container.innerHTML;
    expect(html).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    expect(html).not.toContain('dark:');
  });

  it('emits an aria-label with remaining + pct', () => {
    const { getByRole } = mount(695, 1850);
    const img = getByRole('img');
    const aria = img.getAttribute('aria-label') ?? '';
    expect(aria).toContain('1155');
    expect(aria).toContain('38');
  });

  it('exposes the data-anchor attribute when anchorId is provided', () => {
    const { getByTestId } = render(
      <I18nProvider>
        <EnergyArcCard
          dailyMacros={{ consumed: { cal: 500 }, target: { cal: 1850 } }}
          anchorId="energy"
        />
      </I18nProvider>,
    );
    expect(getByTestId('energy-arc-card').getAttribute('data-anchor')).toBe('energy');
  });

  it('handles target=0 gracefully (renders 0 remaining + 0%)', () => {
    const { getByTestId } = mount(0, 0);
    expect(getByTestId('energy-arc-remaining').textContent).toBe('0');
    const stats = getByTestId('energy-arc-stats');
    expect(stats.textContent).toContain('0%');
  });

  it('does NOT render an overline title — gauge is self-evident as kcal-restantes', () => {
    const { container, queryByTestId } = mount(500, 1850);
    expect(queryByTestId('energy-arc-title')).toBeNull();
    // No <h3> heading elsewhere either.
    expect(container.querySelector('h3[data-heading-level="h3"]')).toBeNull();
  });

  it('SectionCard is transparent (no chrome) — gauge floats free per PDF reference', () => {
    const { container } = mount(500, 1850);
    const section = container.querySelector('section');
    // SectionCard renders as <section>; expect transparent classes.
    expect(section?.className ?? '').toContain('bg-transparent');
    expect(section?.className ?? '').toContain('border-0');
    expect(section?.className ?? '').toContain('shadow-none');
  });

  // ─── Sprint H — editorial gauge upgrade ────────────────────────────────────

  it('Sprint H: progress arc uses linear gradient stroke when on-target', () => {
    const { getByTestId } = mount(500, 1850);
    const progress = getByTestId('energy-arc-progress');
    const stroke = progress.getAttribute('stroke') ?? '';
    expect(stroke).toMatch(/^url\(#/);
  });

  it('Sprint H: progress arc uses solid error stroke when over-target', () => {
    const { getByTestId } = mount(2000, 1500);
    // remaining=0, isOverTarget=true. Need consumed > 0 to render progress.
    const progress = getByTestId('energy-arc-progress');
    expect(progress.getAttribute('stroke')).toBe('var(--color-error)');
  });

  it('Sprint H: needle halo has glow filter applied', () => {
    const { getByTestId } = mount(500, 1850);
    const halo = getByTestId('energy-arc-needle-halo');
    const filter = halo.getAttribute('filter') ?? '';
    expect(filter).toMatch(/^url\(#/);
  });

  it('Sprint H: SVG defs include both a linearGradient and a Gaussian filter', () => {
    const { container } = mount(500, 1850);
    expect(container.querySelector('linearGradient')).toBeTruthy();
    expect(container.querySelector('feGaussianBlur')).toBeTruthy();
  });

  it('Sprint H: gradient stops use --color-macro-fiber and --color-primary tokens', () => {
    const { container } = mount(500, 1850);
    // jsdom can be quirky with SVG nested selectors; read raw HTML to verify both stops exist.
    const html = container.innerHTML;
    expect(html).toContain('var(--color-macro-fiber)');
    expect(html).toContain('var(--color-primary)');
  });

  it('Sprint H: wrapper has no fixed px width by default (fluid clamp applied via CSS)', () => {
    // NOTE: jsdom strips `clamp()` from inline styles silently, so we can't
    // assert "contains clamp" — we assert the absence of any fixed px width
    // and rely on the explicit-size test below for the inverse case.
    const { getByRole } = mount(500, 1850);
    const wrapper = getByRole('img') as HTMLElement;
    expect(wrapper.style.width).toBe('');  // jsdom dropped clamp(...) silently
  });

  it('Sprint H: wrapper width respects explicit `size` prop override', () => {
    const { getByRole } = render(
      <I18nProvider>
        <EnergyArcCard
          dailyMacros={{ consumed: { cal: 500 }, target: { cal: 1850 } }}
          size={300}
        />
      </I18nProvider>,
    );
    const wrapper = getByRole('img') as HTMLElement;
    // jsdom CAN parse fixed px; this should land cleanly.
    expect(wrapper.style.width).toBe('300px');
  });
});
