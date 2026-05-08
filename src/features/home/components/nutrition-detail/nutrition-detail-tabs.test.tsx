/**
 * Smoke tests for the 6 NutritionDetail tab components extracted from the
 * monolithic NutritionDetail screen [1.5.210]. Each tab gets a minimal render
 * test plus a key interaction so a future refactor cannot silently break the
 * locale strings or the prop contract.
 */
import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/helpers/renderWithProviders';
import { computeDailyQuality } from '../../utils/daily-quality';
import type { DailyMacros } from '../../../../contexts/state/useVitalsState';
import { SummaryTab } from './SummaryTab';
import { MacrosTab } from './MacrosTab';
import { VitaminsTab } from './VitaminsTab';
import { MineralsTab } from './MineralsTab';
import { HydrationTab } from './HydrationTab';
import { PerformanceTab } from './PerformanceTab';
import esLocale from '../../../../i18n/locales/es';

const t = esLocale;

const baseMacros: DailyMacros = {
  consumed: { cal: 1155, pro: 90, carbs: 99, fats: 36, fiber: 12 },
  target: { cal: 1850, pro: 160, carbs: 178, fats: 65, fiber: 30 },
};

const baseQuality = computeDailyQuality({ log: [], consumedFiber: 12, targetFiber: 30 });

describe('SummaryTab', () => {
  it('shows the calorie ring and the 3 quick-stat tiles', () => {
    renderWithProviders(
      <SummaryTab
        effectiveDailyMacros={baseMacros}
        dailyQuality={baseQuality}
        remaining={695}
        onSwitchTab={() => {}}
        t={t}
      />,
    );
    // 1155 (consumed) appears in both the ring and the kcal tile; "kcal" too.
    expect(screen.getAllByText(/1155/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('kcal').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('/100')).toBeInTheDocument();
  });

  it('fires onSwitchTab when a tile is clicked', async () => {
    const onSwitchTab = vi.fn();
    renderWithProviders(
      <SummaryTab
        effectiveDailyMacros={baseMacros}
        dailyQuality={baseQuality}
        remaining={695}
        onSwitchTab={onSwitchTab}
        t={t}
      />,
    );
    await userEvent.click(screen.getByText(/calidad/i));
    expect(onSwitchTab).toHaveBeenCalledWith('quality');
  });
});

describe('MacrosTab', () => {
  it('renders 4 macro rows + sugar + saturated fat extras', () => {
    renderWithProviders(
      <MacrosTab
        effectiveDailyMacros={baseMacros}
        dailyQuality={baseQuality}
        t={t}
      />,
    );
    expect(screen.getByTestId('detail-macro-carbs')).toBeInTheDocument();
    expect(screen.getByTestId('detail-macro-protein')).toBeInTheDocument();
    expect(screen.getByTestId('detail-macro-fats')).toBeInTheDocument();
    expect(screen.getByTestId('detail-macro-fiber')).toBeInTheDocument();
    expect(screen.getByText(t.nutritionDetail.sugar)).toBeInTheDocument();
    expect(screen.getByText(t.nutritionDetail.saturatedFat)).toBeInTheDocument();
  });
});

describe('VitaminsTab', () => {
  it('renders the placeholder banner and the title', () => {
    renderWithProviders(<VitaminsTab t={t} />);
    expect(screen.getByText(t.nutritionDetail.vitaminsTab.placeholderBanner)).toBeInTheDocument();
    expect(screen.getByText(t.nutritionDetail.vitaminsTab.title)).toBeInTheDocument();
  });
});

describe('MineralsTab', () => {
  it('renders the placeholder banner and the title', () => {
    renderWithProviders(<MineralsTab t={t} />);
    expect(screen.getByText(t.nutritionDetail.mineralsTab.placeholderBanner)).toBeInTheDocument();
    expect(screen.getByText(t.nutritionDetail.mineralsTab.title)).toBeInTheDocument();
  });
});

describe('HydrationTab', () => {
  it('renders the water row and the add-cup button when viewing today', () => {
    const onAddCup = vi.fn();
    renderWithProviders(
      <HydrationTab
        hydration={{ consumed: 4, target: 10 }}
        isViewingToday={true}
        dailyQuality={baseQuality}
        onAddCup={onAddCup}
        t={t}
      />,
    );
    expect(screen.getByTestId('detail-hydration-row')).toBeInTheDocument();
    expect(screen.getByLabelText(t.home.addWater)).toBeInTheDocument();
    expect(screen.getByText(t.home.hydration.electrolytes)).toBeInTheDocument();
  });

  it('hides the add-cup button when viewing a past day', () => {
    renderWithProviders(
      <HydrationTab
        hydration={{ consumed: 4, target: 10 }}
        isViewingToday={false}
        dailyQuality={baseQuality}
        onAddCup={() => {}}
        t={t}
      />,
    );
    expect(screen.queryByLabelText(t.home.addWater)).not.toBeInTheDocument();
  });
});

describe('PerformanceTab', () => {
  it('fires onNavigateToProgress when the CTA is clicked', async () => {
    const onNavigateToProgress = vi.fn();
    renderWithProviders(
      <PerformanceTab onNavigateToProgress={onNavigateToProgress} t={t} />,
    );
    await userEvent.click(screen.getByTestId('view-progress-cta'));
    expect(onNavigateToProgress).toHaveBeenCalledOnce();
  });
});
