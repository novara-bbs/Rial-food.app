/**
 * WidgetVisibilityPanel — Sprint E [1.5.219] Phase 5.
 *
 * Locks the rendering contract:
 * - Shows the panel toggle button and description in collapsed state
 * - Expands/collapses on toggle click
 * - Renders per-section tier rows when expanded
 * - Calls preferencesActions.setTier on tier button click
 * - Calls preferencesActions.resetPreferences on reset click
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import WidgetVisibilityPanel from './WidgetVisibilityPanel';
import { I18nProvider } from '../../../../i18n';
import { createDefaultPreferences } from '../../../../lib/widget-visibility';

// ─── Mock useAppState ─────────────────────────────────────────────────────────

const mockSetTier = vi.fn();
const mockResetPreferences = vi.fn();
const mockPreferences = createDefaultPreferences();

vi.mock('../../../../contexts/AppStateContext', () => ({
  useAppState: () => ({
    preferences: mockPreferences,
    preferencesActions: {
      setTier: mockSetTier,
      setWidgetOverride: vi.fn(),
      addHealthSource: vi.fn(),
      updateHealthSource: vi.fn(),
      removeHealthSource: vi.fn(),
      resetPreferences: mockResetPreferences,
    },
  }),
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mount() {
  return render(
    <I18nProvider>
      <WidgetVisibilityPanel />
    </I18nProvider>,
  );
}

// ─── Tests ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
});

describe('WidgetVisibilityPanel — collapsed state', () => {
  it('renders without crashing', () => {
    const { container } = mount();
    expect(container.firstChild).not.toBeNull();
  });

  it('shows the panel title', () => {
    const { getByText } = mount();
    // "Personalizar secciones" (ES) or "Customise sections" (EN) — match either
    expect(getByText(/personalizar|customise/i)).toBeDefined();
  });

  it('does not show section rows in collapsed state', () => {
    const { queryByTestId } = mount();
    // Section rows are rendered only when expanded
    expect(queryByTestId('tier-row-home.energy')).toBeNull();
  });
});

describe('WidgetVisibilityPanel — expand/collapse', () => {
  it('expands when the chevron button is clicked', () => {
    const { getByRole, getByTestId } = mount();
    const toggleBtn = getByRole('button', { name: /personalizar|customise/i });
    fireEvent.click(toggleBtn);
    expect(getByTestId('tier-row-home.energy')).toBeDefined();
  });

  it('collapses again when the chevron is clicked a second time', () => {
    const { getByRole, queryByTestId } = mount();
    const toggleBtn = getByRole('button', { name: /personalizar|customise/i });
    fireEvent.click(toggleBtn); // expand
    fireEvent.click(toggleBtn); // collapse
    expect(queryByTestId('tier-row-home.energy')).toBeNull();
  });
});

describe('WidgetVisibilityPanel — expanded state', () => {
  function mountExpanded() {
    const utils = mount();
    // Click the expand toggle
    const toggleBtn = utils.getByRole('button', { name: /personalizar|customise/i });
    fireEvent.click(toggleBtn);
    return utils;
  }

  it('shows a tier row for every section', () => {
    const { getByTestId } = mountExpanded();
    const sections = [
      'home.energy', 'home.macros', 'home.activity', 'home.hydration',
      'home.wellness', 'home.meals', 'nutrition.detail', 'progress.charts',
    ];
    for (const section of sections) {
      expect(getByTestId(`tier-row-${section}`)).toBeDefined();
    }
  });

  it('calls setTier with the correct arguments when a tier button is clicked', () => {
    const { getByTestId } = mountExpanded();
    const row = getByTestId('tier-row-home.energy');
    // Find the 'Advanced' button inside the row
    const advancedBtn = Array.from(row.querySelectorAll('button')).find(
      b => /avanzado|advanced/i.test(b.textContent ?? ''),
    );
    expect(advancedBtn).toBeDefined();
    fireEvent.click(advancedBtn!);
    expect(mockSetTier).toHaveBeenCalledWith('home.energy', 'advanced');
  });

  it('calls resetPreferences when the reset button is clicked', () => {
    const { getByRole } = mountExpanded();
    const resetBtn = getByRole('button', { name: /restablecer|reset/i });
    fireEvent.click(resetBtn);
    expect(mockResetPreferences).toHaveBeenCalledOnce();
  });
});
