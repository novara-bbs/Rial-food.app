/**
 * Tests for RecipeHero — Phase 3.1 (ADR-015).
 * Locks: title rendering, back/share/save callbacks, save-button gating
 * on onSaveRecipe presence, verified-mode taller bleed.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/helpers/renderWithProviders';
import RecipeHero from './RecipeHero';

const baseProps = {
  data: { title: 'Pollo al Limón', tag: 'CLASSIC', prepTime: '15 min', cookTime: '20 min', difficulty: 'Fácil' },
  isVerified: false,
  galleryPhotos: ['https://cdn.example/p1.jpg'],
  onBack: vi.fn(),
  setLightboxIdx: vi.fn(),
  onSharePress: vi.fn(),
  onBookmarkPress: vi.fn(),
};

beforeEach(() => {
  window.localStorage.clear();
  vi.clearAllMocks();
});

describe('RecipeHero', () => {
  it('renders the recipe title', () => {
    renderWithProviders(<RecipeHero {...baseProps} onSaveRecipe={vi.fn()} />);
    expect(screen.getByText('Pollo al Limón')).toBeTruthy();
  });

  it('renders the tag badge', () => {
    renderWithProviders(<RecipeHero {...baseProps} onSaveRecipe={vi.fn()} />);
    expect(screen.getByText('CLASSIC')).toBeTruthy();
  });

  it('hides the tag badge when data.tag is missing', () => {
    renderWithProviders(<RecipeHero {...baseProps} data={{ ...baseProps.data, tag: undefined }} onSaveRecipe={vi.fn()} />);
    expect(screen.queryByText('CLASSIC')).toBeNull();
  });

  it('shows the time/difficulty row in classic mode', () => {
    renderWithProviders(<RecipeHero {...baseProps} onSaveRecipe={vi.fn()} />);
    expect(screen.getByText(/15 min/)).toBeTruthy();
    expect(screen.getByText(/Fácil/)).toBeTruthy();
  });

  it('hides the time/difficulty row in verified mode (replaced by TimeTileComposite)', () => {
    renderWithProviders(<RecipeHero {...baseProps} isVerified onSaveRecipe={vi.fn()} />);
    expect(screen.queryByText(/15 min/)).toBeNull();
  });

  it('fires onBack when the back button is clicked', async () => {
    const onBack = vi.fn();
    renderWithProviders(<RecipeHero {...baseProps} onBack={onBack} onSaveRecipe={vi.fn()} />);
    await userEvent.click(screen.getByLabelText(/back|atrás/i));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('fires onSharePress when the share button is clicked', async () => {
    const onSharePress = vi.fn();
    renderWithProviders(<RecipeHero {...baseProps} onSharePress={onSharePress} onSaveRecipe={vi.fn()} />);
    // Share button has aria-label = t.recipeDetail.shareToFeed = 'Share to community' (en)
    await userEvent.click(screen.getByLabelText(/share|compartir/i));
    expect(onSharePress).toHaveBeenCalledTimes(1);
  });

  it('hides the bookmark button when onSaveRecipe is undefined', () => {
    renderWithProviders(<RecipeHero {...baseProps} onSaveRecipe={undefined} />);
    expect(screen.queryByLabelText(/save|guardar/i)).toBeNull();
  });

  it('shows the bookmark button when onSaveRecipe is wired', () => {
    renderWithProviders(<RecipeHero {...baseProps} onSaveRecipe={vi.fn()} />);
    expect(screen.getByLabelText(/save|guardar/i)).toBeTruthy();
  });

  it('reflects isSaved=true via aria-pressed', () => {
    renderWithProviders(<RecipeHero {...baseProps} isSaved onSaveRecipe={vi.fn()} />);
    const btn = screen.getByLabelText(/save|guardar/i);
    expect(btn.getAttribute('aria-pressed')).toBe('true');
  });
});
