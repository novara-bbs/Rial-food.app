/**
 * Tests for RecipeOverviewTab — Phase 3.1 (ADR-015).
 * Locks: description + match-score render, primary CTAs (Log meal /
 * Add to plan / Mark cooked) callback wiring, Versionar gating on
 * data.publishedBy + isPro, day selector visibility gating.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useRef } from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/helpers/renderWithProviders';
import RecipeOverviewTab from './RecipeOverviewTab';

function RefHarness({ children }: { children: (ref: React.RefObject<HTMLDivElement | null>) => React.ReactNode }) {
  const ref = useRef<HTMLDivElement | null>(null);
  return <>{children(ref)}</>;
}

const baseRecipe = { id: 'r-1', description: 'Healthy dish', publishedBy: 'self' };

function makeProps(overrides: Partial<React.ComponentProps<typeof RecipeOverviewTab>> = {}) {
  return {
    data: baseRecipe,
    matchScore: 85,
    swapSuggestions: [],
    applySwap: vi.fn(),
    userProfile: { goal: 'maintain', foodPreferences: {}, intolerances: [] },
    isPro: false,
    cookedCount: 0,
    servings: 4,
    quickActionsRef: { current: null },
    getModifiedRecipe: () => baseRecipe,
    onLogMealNow: vi.fn(),
    onAddToPlan: vi.fn(),
    handleMarkAsCooked: vi.fn(),
    showDaySelector: false,
    setShowDaySelector: vi.fn(),
    setShowDuplicateConfirm: vi.fn(),
    navigateTo: vi.fn(),
    communityPosts: [],
    ...overrides,
  };
}

beforeEach(() => {
  window.localStorage.clear();
  vi.clearAllMocks();
});

describe('RecipeOverviewTab — header', () => {
  it('renders the recipe description', () => {
    renderWithProviders(
      <RefHarness>{ref => <RecipeOverviewTab {...makeProps({ quickActionsRef: ref })} />}</RefHarness>,
      { inTabs: { defaultValue: 'overview' } },
    );
    expect(screen.getByText('Healthy dish')).toBeTruthy();
  });

  it('renders the match score percentage', () => {
    renderWithProviders(
      <RefHarness>{ref => <RecipeOverviewTab {...makeProps({ quickActionsRef: ref })} />}</RefHarness>,
      { inTabs: { defaultValue: 'overview' } },
    );
    expect(screen.getByText('85%')).toBeTruthy();
  });
});

describe('RecipeOverviewTab — primary actions', () => {
  it('clicking "Log meal" fires onLogMealNow with the modified recipe and servings', async () => {
    const onLogMealNow = vi.fn();
    renderWithProviders(
      <RefHarness>
        {ref => <RecipeOverviewTab {...makeProps({ quickActionsRef: ref, onLogMealNow })} />}
      </RefHarness>,
      { inTabs: { defaultValue: 'overview' } },
    );
    // "Log meal" button — matches t.recipeDetail.logMeal
    const buttons = screen.getAllByRole('button');
    const logBtn = buttons.find(b => /log meal|registrar comida/i.test(b.textContent || ''));
    expect(logBtn).toBeTruthy();
    await userEvent.click(logBtn!);
    expect(onLogMealNow).toHaveBeenCalledWith(baseRecipe, 4);
  });

  it('clicking "Add to plan" opens the day selector', async () => {
    const setShowDaySelector = vi.fn();
    renderWithProviders(
      <RefHarness>
        {ref => <RecipeOverviewTab {...makeProps({ quickActionsRef: ref, setShowDaySelector })} />}
      </RefHarness>,
      { inTabs: { defaultValue: 'overview' } },
    );
    const buttons = screen.getAllByRole('button');
    const planBtn = buttons.find(b => /add to plan|al plan/i.test(b.textContent || ''));
    expect(planBtn).toBeTruthy();
    await userEvent.click(planBtn!);
    expect(setShowDaySelector).toHaveBeenCalledWith(true);
  });

  it('clicking "Mark as Cooked" fires handleMarkAsCooked', async () => {
    const handleMarkAsCooked = vi.fn();
    renderWithProviders(
      <RefHarness>
        {ref => <RecipeOverviewTab {...makeProps({ quickActionsRef: ref, handleMarkAsCooked })} />}
      </RefHarness>,
      { inTabs: { defaultValue: 'overview' } },
    );
    const cookedBtn = screen.getByText(/mark as cooked|marcar como cocinada/i).closest('button');
    expect(cookedBtn).toBeTruthy();
    await userEvent.click(cookedBtn!);
    expect(handleMarkAsCooked).toHaveBeenCalledWith(baseRecipe);
  });
});

describe('RecipeOverviewTab — Versionar (Pro fork) gating', () => {
  it('hides Versionar when data.publishedBy === "self"', () => {
    renderWithProviders(
      <RefHarness>
        {ref => <RecipeOverviewTab {...makeProps({ quickActionsRef: ref, data: { ...baseRecipe, publishedBy: 'self' } })} />}
      </RefHarness>,
      { inTabs: { defaultValue: 'overview' } },
    );
    expect(screen.queryByText(/create my version|crear mi versión/i)).toBeNull();
  });

  it('shows Versionar when data.publishedBy is not "self"', () => {
    renderWithProviders(
      <RefHarness>
        {ref => <RecipeOverviewTab {...makeProps({ quickActionsRef: ref, data: { ...baseRecipe, publishedBy: 'creator-1' } })} />}
      </RefHarness>,
      { inTabs: { defaultValue: 'overview' } },
    );
    expect(screen.getByText(/create my version|crear mi versión/i)).toBeTruthy();
  });

  it('Versionar click navigates to RIAL+ when user is not Pro', async () => {
    const navigateTo = vi.fn();
    renderWithProviders(
      <RefHarness>
        {ref => <RecipeOverviewTab {...makeProps({ quickActionsRef: ref, isPro: false, data: { ...baseRecipe, publishedBy: 'creator-1' }, navigateTo })} />}
      </RefHarness>,
      { inTabs: { defaultValue: 'overview' } },
    );
    const versionBtn = screen.getByText(/create my version|crear mi versión/i).closest('button');
    await userEvent.click(versionBtn!);
    expect(navigateTo).toHaveBeenCalledWith('rial-plus');
  });

  it('Versionar click opens duplicate-confirm when user is Pro', async () => {
    const setShowDuplicateConfirm = vi.fn();
    renderWithProviders(
      <RefHarness>
        {ref => <RecipeOverviewTab {...makeProps({ quickActionsRef: ref, isPro: true, data: { ...baseRecipe, publishedBy: 'creator-1' }, setShowDuplicateConfirm })} />}
      </RefHarness>,
      { inTabs: { defaultValue: 'overview' } },
    );
    const versionBtn = screen.getByText(/create my version|crear mi versión/i).closest('button');
    await userEvent.click(versionBtn!);
    expect(setShowDuplicateConfirm).toHaveBeenCalledWith(true);
  });
});
