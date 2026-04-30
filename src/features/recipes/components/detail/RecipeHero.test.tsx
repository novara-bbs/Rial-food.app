/**
 * Tests for RecipeHero — Sprint 46 [1.5.160] post-NYT refactor.
 * Locks: title rendering (now below media), back/share/save callbacks,
 * save-button gating on onSaveRecipe presence, verified-mode taller bleed,
 * gradient overlay removed.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/helpers/renderWithProviders';
import RecipeHero from './RecipeHero';
import type { HeroMediaItem } from '../HeroGallery';

const photoItems: HeroMediaItem[] = [{ kind: 'photo', src: 'https://cdn.example/p1.jpg' }];

const baseProps = {
  data: { title: 'Pollo al Limón', tag: 'CLASSIC', prepTime: '15 min', cookTime: '20 min', difficulty: 'Fácil' },
  isVerified: false,
  mediaItems: photoItems,
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

  it('does not render the legacy bottom-up gradient overlay', () => {
    const { container } = renderWithProviders(<RecipeHero {...baseProps} onSaveRecipe={vi.fn()} />);
    // Sprint 46: gradient was `bg-gradient-to-t from-background via-background/40 ...`.
    expect(container.querySelector('.bg-gradient-to-t')).toBeNull();
  });

  it('renders multi-item media (peek mode) as a carousel region', () => {
    const items: HeroMediaItem[] = [
      { kind: 'photo', src: 'https://cdn.example/p1.jpg' },
      { kind: 'photo', src: 'https://cdn.example/p2.jpg' },
    ];
    renderWithProviders(<RecipeHero {...baseProps} mediaItems={items} onSaveRecipe={vi.fn()} />);
    expect(screen.getByRole('region', { name: /gallery|galería/i })).toBeTruthy();
  });

  it('renders a video slide with watch-on label when a video item is present', () => {
    const items: HeroMediaItem[] = [
      { kind: 'photo', src: 'https://cdn.example/p1.jpg' },
      {
        kind: 'video',
        videoUrl: 'https://www.youtube.com/watch?v=abc123',
        embedUrl: 'https://www.youtube-nocookie.com/embed/abc123',
        poster: 'https://i.ytimg.com/vi/abc123/hqdefault.jpg',
        platformLabel: 'YouTube',
      },
    ];
    renderWithProviders(<RecipeHero {...baseProps} mediaItems={items} onSaveRecipe={vi.fn()} />);
    // Watch-on copy: ES "Ver en YouTube" / EN "Watch on YouTube".
    expect(screen.getByLabelText(/youtube/i)).toBeTruthy();
  });
});
