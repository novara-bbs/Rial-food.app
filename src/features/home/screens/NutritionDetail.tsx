/**
 * NutritionDetail — 7-tab "Nutrición total" screen.
 *
 * Tabs:  Resumen · Macros · Calidad · Vitaminas · Minerales · Hidratación · Rendimiento
 *
 * Shares the same `selectedDate` atom as Home so past-day navigation is
 * consistent. Reads `dailyLog` from AppStateContext to compute daily quality
 * metrics. Vitamins + minerals show placeholder values until per-entry micro
 * aggregation lands.
 *
 * Opening on a specific tab: set `nutritionDetailTab` via the exported
 * `setNutritionDetailInitialTab` helper before calling `navigateTo('nutrition-detail')`.
 *
 * Each tab renders from its own component under `../components/nutrition-detail/`.
 */
import { useState, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import PageShell from '../../../components/PageShell';
import PageHeader from '../../../components/patterns/PageHeader';
import TabNav from '../../../components/patterns/TabNav';
import FoodQualityCard from '../components/FoodQualityCard';
import DatePickerSheet from '../components/DatePickerSheet';
import { SummaryTab } from '../components/nutrition-detail/SummaryTab';
import { MacrosTab } from '../components/nutrition-detail/MacrosTab';
import { VitaminsTab } from '../components/nutrition-detail/VitaminsTab';
import { MineralsTab } from '../components/nutrition-detail/MineralsTab';
import { HydrationTab } from '../components/nutrition-detail/HydrationTab';
import { PerformanceTab } from '../components/nutrition-detail/PerformanceTab';
import { useI18n } from '../../../i18n';
import { useAppState } from '../../../contexts/AppStateContext';
import { useNavigation } from '../../../contexts/NavigationContext';
import { useSelectedDayMacros } from '../hooks/useSelectedDayMacros';
import { computeDailyQuality } from '../utils/daily-quality';
import { todayLocal, dateToLocal } from '../../../lib/dates';
import { consumeNutritionDetailInitialTab } from '../utils/nutrition-detail-nav';

export default function NutritionDetail({ onBack }: { onBack: () => void }) {
  const { t, locale } = useI18n();
  const { navigateTo } = useNavigation();
  const {
    dailyMacros,
    dailyLog,
    hydration,
    setHydration,
    nutritionHistory,
    selectedDate,
    setSelectedDate,
  } = useAppState();
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const initialTabRef = useRef(consumeNutritionDetailInitialTab());
  const [activeTab, setActiveTab] = useState<string>(initialTabRef.current);

  const { effectiveDailyMacros, isViewingToday } = useSelectedDayMacros(
    selectedDate,
    dailyMacros,
    nutritionHistory,
  );

  const dailyQuality = computeDailyQuality({
    log: dailyLog,
    consumedFiber: effectiveDailyMacros.consumed.fiber ?? 0,
    targetFiber: effectiveDailyMacros.target.fiber,
  });

  const addCup = () => {
    if (!isViewingToday) return;
    setHydration((prev) => ({ ...prev, consumed: Math.min(prev.consumed + 1, prev.target + 5) }));
  };

  const dateLabel = (() => {
    const todayISO = todayLocal();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayISO = dateToLocal(yesterday);
    if (selectedDate === todayISO) return t.home.dayPicker.today;
    if (selectedDate === yesterdayISO) return t.home.dayPicker.yesterday;
    const sel = new Date(`${selectedDate}T00:00:00`);
    const dayName = new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(sel);
    const shortDate = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' }).format(sel);
    return `${dayName}, ${shortDate}`;
  })();

  const remaining = Math.max(0, effectiveDailyMacros.target.cal - effectiveDailyMacros.consumed.cal);

  const tabs = [
    { id: 'summary',     label: t.nutritionDetail.tabs.summary     },
    { id: 'macros',      label: t.nutritionDetail.tabs.macros      },
    { id: 'quality',     label: t.nutritionDetail.tabs.quality     },
    { id: 'vitamins',    label: t.nutritionDetail.tabs.vitamins    },
    { id: 'minerals',    label: t.nutritionDetail.tabs.minerals    },
    { id: 'hydration',   label: t.nutritionDetail.tabs.hydration   },
    { id: 'performance', label: t.nutritionDetail.tabs.performance },
  ];

  return (
    <PageShell noPadding spacing="sm">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-outline-variant/20">
        <div className="px-4">
          <PageHeader
            onBack={onBack}
            title={t.nutritionDetail.title}
            rightAction={
              <button
                type="button"
                onClick={() => setDatePickerOpen(true)}
                aria-label={t.home.dayPicker.ariaLabel}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-surface-container-low border border-outline-variant/30 hover:bg-surface-container-highest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 transition-colors capitalize"
                data-testid="detail-date-pill"
              >
                <span className="font-body text-body-sm font-semibold text-on-surface">
                  {dateLabel}
                </span>
                <ChevronDown className="w-4 h-4 text-on-surface-variant shrink-0" aria-hidden="true" />
              </button>
            }
          />
        </div>
        <div className="overflow-x-auto hide-scrollbar">
          <TabNav
            tabs={tabs}
            active={activeTab}
            onChange={setActiveTab}
          />
        </div>
      </div>

      <div className="px-4 pt-4 pb-8 space-y-4">
        {activeTab === 'summary' && (
          <SummaryTab
            effectiveDailyMacros={effectiveDailyMacros}
            dailyQuality={dailyQuality}
            remaining={remaining}
            onSwitchTab={setActiveTab}
            t={t}
          />
        )}

        {activeTab === 'macros' && (
          <MacrosTab
            effectiveDailyMacros={effectiveDailyMacros}
            dailyQuality={dailyQuality}
            t={t}
          />
        )}

        {activeTab === 'quality' && (
          <FoodQualityCard
            quality={dailyQuality}
            defaultExpanded
            anchorId="quality-detail"
          />
        )}

        {activeTab === 'vitamins' && <VitaminsTab t={t} />}

        {activeTab === 'minerals' && <MineralsTab t={t} />}

        {activeTab === 'hydration' && (
          <HydrationTab
            hydration={hydration}
            isViewingToday={isViewingToday}
            dailyQuality={dailyQuality}
            onAddCup={addCup}
            t={t}
          />
        )}

        {activeTab === 'performance' && (
          <PerformanceTab
            onNavigateToProgress={() => navigateTo('progress')}
            t={t}
          />
        )}
      </div>

      <DatePickerSheet
        open={datePickerOpen}
        onOpenChange={setDatePickerOpen}
        selectedDate={selectedDate}
        todayKcal={dailyMacros.consumed.cal}
        history={nutritionHistory}
        onSelect={setSelectedDate}
      />
    </PageShell>
  );
}
