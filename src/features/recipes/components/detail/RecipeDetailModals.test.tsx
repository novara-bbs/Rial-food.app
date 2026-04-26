/**
 * Tests for RecipeDetailModals — Phase 3.1 (ADR-015).
 * Locks: each modal renders only when its show flag is true. Confirm
 * dialog button wiring fires the right handler with the right argument.
 *
 * The lightbox + variant picker + publish sheet are full external
 * components — we only verify the gating logic, not their internals
 * (those are tested elsewhere).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/helpers/renderWithProviders';
import RecipeDetailModals from './RecipeDetailModals';

const baseRecipe = { id: 'r-1', title: 'Test Recipe' };

function makeProps(overrides: Partial<React.ComponentProps<typeof RecipeDetailModals>> = {}) {
  return {
    data: baseRecipe,
    getModifiedRecipe: () => baseRecipe,
    galleryPhotos: [],
    showPublishSheet: false,
    setShowPublishSheet: vi.fn(),
    lightboxIdx: null,
    setLightboxIdx: vi.fn(),
    showDeleteConfirm: false,
    setShowDeleteConfirm: vi.fn(),
    handleDeleteRecipe: vi.fn(),
    showDuplicateConfirm: false,
    setShowDuplicateConfirm: vi.fn(),
    handleDuplicateRecipe: vi.fn(),
    showUnsaveConfirm: false,
    setShowUnsaveConfirm: vi.fn(),
    onSaveRecipe: vi.fn(),
    swapTarget: null,
    setSwapTarget: vi.fn(),
    mergedVariants: [],
    userVariants: [],
    applyVariantSwap: vi.fn(),
    ...overrides,
  };
}

beforeEach(() => {
  window.localStorage.clear();
  vi.clearAllMocks();
});

describe('RecipeDetailModals — gating', () => {
  it('renders nothing visible when all show flags are false', () => {
    renderWithProviders(<RecipeDetailModals {...makeProps()} />);
    // No dialog roles open
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('shows the delete confirm dialog when showDeleteConfirm=true', () => {
    renderWithProviders(<RecipeDetailModals {...makeProps({ showDeleteConfirm: true })} />);
    // ConfirmDialog uses role=alertdialog or dialog depending on shadcn version
    const dialog = screen.queryByRole('alertdialog') || screen.queryByRole('dialog');
    expect(dialog).toBeTruthy();
  });

  it('shows the duplicate confirm dialog when showDuplicateConfirm=true', () => {
    renderWithProviders(<RecipeDetailModals {...makeProps({ showDuplicateConfirm: true })} />);
    expect(screen.getByText(/Test Recipe/)).toBeTruthy();
  });

  it('shows the unsave confirm dialog when showUnsaveConfirm=true', () => {
    renderWithProviders(<RecipeDetailModals {...makeProps({ showUnsaveConfirm: true })} />);
    const dialog = screen.queryByRole('alertdialog') || screen.queryByRole('dialog');
    expect(dialog).toBeTruthy();
  });
});

describe('RecipeDetailModals — confirm wiring', () => {
  it('confirming delete fires handleDeleteRecipe with data.id', async () => {
    const handleDeleteRecipe = vi.fn();
    renderWithProviders(
      <RecipeDetailModals {...makeProps({ showDeleteConfirm: true, handleDeleteRecipe })} />,
    );
    // Find the destructive confirm button (text: Yes, delete / Sí, eliminar)
    const confirmBtn = screen.getByRole('button', { name: /yes|sí/i });
    await userEvent.click(confirmBtn);
    expect(handleDeleteRecipe).toHaveBeenCalledWith('r-1');
  });

  it('confirming duplicate fires handleDuplicateRecipe with the modified recipe', async () => {
    const handleDuplicateRecipe = vi.fn();
    renderWithProviders(
      <RecipeDetailModals {...makeProps({ showDuplicateConfirm: true, handleDuplicateRecipe })} />,
    );
    // Find the Duplicar / Duplicate button (NOT cancel)
    const buttons = screen.getAllByRole('button');
    const dupBtn = buttons.find(b => /duplicate|duplicar/i.test(b.textContent || ''));
    expect(dupBtn).toBeTruthy();
    await userEvent.click(dupBtn!);
    expect(handleDuplicateRecipe).toHaveBeenCalledWith(baseRecipe);
  });
});
