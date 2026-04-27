/**
 * Tests for RecipeNutritionTab — Phase 3.1 (ADR-015).
 * Locks: macro rows render with scale applied, micros visible only when
 * present, goal-optimization section gated on suggestions.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test/helpers/renderWithProviders';
import RecipeNutritionTab from './RecipeNutritionTab';
import type { Micronutrients } from '@/types';
import type { UserProfile } from '@/types/user';

const emptyMicros: Micronutrients = { vitamins: {}, minerals: {}, others: {} };

const baseTotals = {
  cal: 500,
  pro: 30,
  carbs: 50,
  fats: 20,
  micros: emptyMicros,
};

const baseProps = {
  data: { macros: { saturatedFat: 5, sugar: 10, fiber: 8 }, micros: { others: { cholesterol: 100 }, minerals: { sodium: 600 }, vitamins: {} } },
  calculatedTotals: baseTotals,
  s: 1,
  goalSuggestions: [],
  userProfile: { goal: 'maintain' } as unknown as UserProfile,
  setExtraIngredients: vi.fn(),
  applySwap: vi.fn(),
};

beforeEach(() => {
  window.localStorage.clear();
});

describe('RecipeNutritionTab — macros table', () => {
  it('renders calorie + macro rows with raw values when scale=1', () => {
    renderWithProviders(
      <RecipeNutritionTab {...baseProps} />,
      { inTabs: { defaultValue: 'nutrition' } },
    );
    expect(screen.getByText('500 kcal')).toBeTruthy();
    expect(screen.getByText('30g')).toBeTruthy();
    expect(screen.getByText('50g')).toBeTruthy();
    expect(screen.getByText('20g')).toBeTruthy();
  });

  it('multiplies by scale when s=2', () => {
    renderWithProviders(
      <RecipeNutritionTab {...baseProps} s={2} />,
      { inTabs: { defaultValue: 'nutrition' } },
    );
    expect(screen.getByText('1000 kcal')).toBeTruthy();
    expect(screen.getByText('60g')).toBeTruthy();
  });

  it('shows cholesterol + sodium with mg units', () => {
    renderWithProviders(
      <RecipeNutritionTab {...baseProps} />,
      { inTabs: { defaultValue: 'nutrition' } },
    );
    expect(screen.getByText('100mg')).toBeTruthy();
    expect(screen.getByText('600mg')).toBeTruthy();
  });
});

describe('RecipeNutritionTab — micronutrients section gating', () => {
  it('hides the micros section when both vitamins + minerals are empty', () => {
    renderWithProviders(
      <RecipeNutritionTab {...baseProps} />,
      { inTabs: { defaultValue: 'nutrition' } },
    );
    // The "Micronutrients" heading (t.recipeDetail.micronutrients) shouldn't render.
    expect(screen.queryByText(/micronutrient|micronutriente/i)).toBeNull();
  });

  it('shows the micros section when vitamins are present', () => {
    const totalsWithVit = {
      ...baseTotals,
      micros: { vitamins: { vitC: 50 }, minerals: {}, others: {} } as Micronutrients,
    };
    renderWithProviders(
      <RecipeNutritionTab {...baseProps} calculatedTotals={totalsWithVit} />,
      { inTabs: { defaultValue: 'nutrition' } },
    );
    expect(screen.getByText(/micronutrient|micronutriente/i)).toBeTruthy();
    expect(screen.getByText(/vitC/)).toBeTruthy();
  });
});

describe('RecipeNutritionTab — goal optimization section gating', () => {
  it('hides the goal section when goalSuggestions is empty', () => {
    renderWithProviders(
      <RecipeNutritionTab {...baseProps} />,
      { inTabs: { defaultValue: 'nutrition' } },
    );
    // "Optimize for goal" heading isn't present.
    expect(screen.queryByText(/optimize|optimizar/i)).toBeNull();
  });

  it('shows the goal section + Volumen badge when suggestions present + goal=muscle', () => {
    const goalSuggestions = [
      { type: 'add', ingredient: { id: 'whey', name: 'Whey', baseUnit: 'g', servingSizes: [{ grams: 30 }] }, rationale: 'Boost protein', macroImpact: { cal: 120 } },
    ];
    renderWithProviders(
      <RecipeNutritionTab {...baseProps} goalSuggestions={goalSuggestions} userProfile={{ goal: 'muscle' } as unknown as UserProfile} />,
      { inTabs: { defaultValue: 'nutrition' } },
    );
    expect(screen.getByText(/optimize|optimizar/i)).toBeTruthy();
    expect(screen.getByText(/whey/i)).toBeTruthy();
  });
});
