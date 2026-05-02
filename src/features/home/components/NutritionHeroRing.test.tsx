/**
 * Tests for NutritionHeroRing — post-1.5.186 redesign.
 * Locks:
 *   - Advanced mode renders 4 macro rows including fiber.
 *   - "Ver detalle" CTA appears in advanced mode and fires the callback.
 *   - Simple mode keeps the legacy centered ring + remaining (no CTA).
 *   - Ring percentage matches consumed/target ratio.
 */
import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/helpers/renderWithProviders';
import NutritionHeroRing from './NutritionHeroRing';

const baseMacros = {
  consumed: { cal: 1155, pro: 90, carbs: 99, fats: 36, fiber: 12 },
  target: { cal: 1850, pro: 160, carbs: 178, fats: 65, fiber: 30 },
};

describe('NutritionHeroRing — advanced mode', () => {
  it('renders the 4 macro rows including fiber', () => {
    renderWithProviders(<NutritionHeroRing dailyMacros={baseMacros} mode="advanced" />);
    expect(screen.getByTestId('macro-row-carbs')).toBeInTheDocument();
    expect(screen.getByTestId('macro-row-protein')).toBeInTheDocument();
    expect(screen.getByTestId('macro-row-fats')).toBeInTheDocument();
    expect(screen.getByTestId('macro-row-fiber')).toBeInTheDocument();
  });

  it('shows the consumed percentage left of the ring', () => {
    // 1155 / 1850 = 62.43% → rounded 62
    renderWithProviders(<NutritionHeroRing dailyMacros={baseMacros} mode="advanced" />);
    const pctBlock = screen.getByTestId('hero-ring-pct');
    expect(pctBlock.textContent).toContain('62%');
  });

  it('renders the "View nutrition detail" CTA when callback is provided', async () => {
    const onNavigate = vi.fn();
    renderWithProviders(
      <NutritionHeroRing dailyMacros={baseMacros} mode="advanced" onNavigateToNutritionDetail={onNavigate} />,
    );
    const cta = screen.getByTestId('nutrition-detail-cta');
    expect(cta).toBeInTheDocument();
    await userEvent.click(cta);
    expect(onNavigate).toHaveBeenCalledTimes(1);
  });

  it('does NOT render the CTA when callback is omitted', () => {
    renderWithProviders(<NutritionHeroRing dailyMacros={baseMacros} mode="advanced" />);
    expect(screen.queryByTestId('nutrition-detail-cta')).toBeNull();
  });

  it('falls back to default fiber target when not present in state', () => {
    const macrosNoFiber = {
      consumed: { cal: 0, pro: 0, carbs: 0, fats: 0 },
      target: { cal: 2400, pro: 180, carbs: 250, fats: 65 },
    };
    renderWithProviders(<NutritionHeroRing dailyMacros={macrosNoFiber} mode="advanced" />);
    const fiberRow = screen.getByTestId('macro-row-fiber');
    // Default target = 30 → "0/30g"
    expect(fiberRow.textContent).toContain('0/30');
  });
});

describe('NutritionHeroRing — simple mode (compact pill)', () => {
  it('renders only the compact pill — no big ring, no macros card, no goal chip', () => {
    renderWithProviders(<NutritionHeroRing dailyMacros={baseMacros} mode="simple" goal="cut" />);
    expect(screen.getByTestId('hero-simple-pill')).toBeInTheDocument();
    expect(screen.queryByTestId('hero-ring-pct')).toBeNull();
    expect(screen.queryByTestId('macro-row-carbs')).toBeNull();
    expect(screen.queryByTestId('macro-row-fiber')).toBeNull();
    expect(screen.queryByTestId('goal-status-chip')).toBeNull();
  });

  it('shows consumed/target kcal and the kcal label', () => {
    renderWithProviders(<NutritionHeroRing dailyMacros={baseMacros} mode="simple" />);
    const pill = screen.getByTestId('hero-simple-pill');
    expect(pill.textContent).toContain('1155');
    expect(pill.textContent).toContain('1850');
    expect(pill.textContent?.toLowerCase()).toContain('kcal');
  });

  it('is a button when onNavigateToNutritionDetail is provided', async () => {
    const onNavigate = vi.fn();
    renderWithProviders(
      <NutritionHeroRing dailyMacros={baseMacros} mode="simple" onNavigateToNutritionDetail={onNavigate} />,
    );
    const pill = screen.getByTestId('hero-simple-pill');
    expect(pill.tagName).toBe('BUTTON');
    await userEvent.click(pill);
    expect(onNavigate).toHaveBeenCalledTimes(1);
  });

  it('falls back to a non-interactive div when callback is omitted', () => {
    renderWithProviders(<NutritionHeroRing dailyMacros={baseMacros} mode="simple" />);
    const pill = screen.getByTestId('hero-simple-pill');
    expect(pill.tagName).toBe('DIV');
  });
});
