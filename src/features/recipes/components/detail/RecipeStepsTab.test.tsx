/**
 * Tests for RecipeStepsTab — Phase 3.1 (ADR-015).
 *
 * Pure presentation component; only thing to lock is the user-visible
 * behavior: list rendering + Cook Mode trigger.
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tabs } from '@/components/ui/tabs';
import { I18nProvider } from '@/i18n';
import RecipeStepsTab from './RecipeStepsTab';

function renderInTabs(ui: React.ReactNode) {
  return render(
    <I18nProvider>
      <Tabs defaultValue="steps">{ui}</Tabs>
    </I18nProvider>,
  );
}

describe('RecipeStepsTab', () => {
  it('renders the step count label with the count', () => {
    renderInTabs(<RecipeStepsTab cookSteps={['Step A', 'Step B', 'Step C']} openCookMode={vi.fn()} />);
    // "3" appears multiple times (count + step 3 badge); query the count label container by its uppercase tracking-widest class.
    const countLabel = document.querySelector('.uppercase.tracking-widest');
    expect(countLabel?.textContent).toContain('3');
  });

  it('renders one item per step with sequential numbering', () => {
    renderInTabs(<RecipeStepsTab cookSteps={['Step 1 text', 'Step 2 text']} openCookMode={vi.fn()} />);
    expect(screen.getByText('Step 1 text')).toBeTruthy();
    expect(screen.getByText('Step 2 text')).toBeTruthy();
    // Sequential numbering 1, 2 (rendered inside circular badges)
    expect(screen.getByText('1')).toBeTruthy();
    expect(screen.getByText('2')).toBeTruthy();
  });

  it('supports the canonical {id, text} step shape', () => {
    renderInTabs(<RecipeStepsTab
      cookSteps={[{ id: 's-1', text: 'Mix flour' }, { id: 's-2', text: 'Bake at 180°C' }]}
      openCookMode={vi.fn()}
    />);
    expect(screen.getByText('Mix flour')).toBeTruthy();
    expect(screen.getByText('Bake at 180°C')).toBeTruthy();
  });

  it('renders the Cook Mode CTA button', () => {
    renderInTabs(<RecipeStepsTab cookSteps={['s']} openCookMode={vi.fn()} />);
    // The button text is t.recipeDetail.cookMode — match either locale.
    const button = screen.getByRole('button');
    const text = button.textContent?.toLowerCase() || '';
    expect(text === ' cook mode' || text.includes('cocina')).toBe(true);
  });

  it('fires openCookMode when the CTA is clicked', async () => {
    const openCookMode = vi.fn();
    renderInTabs(<RecipeStepsTab cookSteps={['s']} openCookMode={openCookMode} />);
    const button = screen.getByRole('button');
    await userEvent.click(button);
    expect(openCookMode).toHaveBeenCalledTimes(1);
  });

  it('renders an empty list when cookSteps is empty (still shows the "0" count)', () => {
    renderInTabs(<RecipeStepsTab cookSteps={[]} openCookMode={vi.fn()} />);
    expect(screen.getByText(/0/)).toBeTruthy();
  });
});
