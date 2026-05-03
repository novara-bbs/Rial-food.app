/**
 * NutritionDetail — Sprint E 7-tab "Nutrición total" screen.
 *
 * Tabs:  Resumen · Macros · Calidad · Vitaminas · Minerales · Hidratación · Rendimiento
 *
 * Shares the same `selectedDate` atom as Home so past-day navigation is
 * consistent. Reads `dailyLog` from AppStateContext to compute daily quality
 * metrics (Sprint D util). Vitamins + minerals show placeholder values until
 * per-entry micro aggregation lands (Sprint G backfill).
 *
 * Opening on a specific tab: set `nutritionDetailTab` via the exported
 * `setNutritionDetailInitialTab` helper before calling `navigateTo('nutrition-detail')`.
 */
import { useState, useRef } from 'react';
import { ChevronDown, ChevronRight, Plus, Zap, BarChart3, ShieldCheck, TrendingUp } from 'lucide-react';
import PageShell from '../../../components/PageShell';
import PageHeader from '../../../components/patterns/PageHeader';
import SectionCard from '../../../components/SectionCard';
import { Heading, Text } from '../../../components/ui/Typography';
import { Button } from '@/components/ui/button';
import TabNav from '../../../components/patterns/TabNav';
import { useI18n } from '../../../i18n';
import { useAppState } from '../../../contexts/AppStateContext';
import { useNavigation } from '../../../contexts/NavigationContext';
import { CalorieRing } from '../components/NutritionHeroRing';
import MacroProgressRow from '../components/MacroProgressRow';
import FoodQualityCard from '../components/FoodQualityCard';
import SmartInsightCard from '../components/SmartInsightCard';
import DatePickerSheet from '../components/DatePickerSheet';
import NutritionRow from '../components/NutritionRow';
import { useSelectedDayMacros } from '../hooks/useSelectedDayMacros';
import { computeDailyQuality } from '../utils/daily-quality';
import {
  VITAMIN_RDAS,
  MINERAL_RDAS,
  SALT_TO_SODIUM_MG_FACTOR,
  DEFAULT_FIBER_TARGET_G,
  type VitaminKey,
  type MineralKey,
} from '../data/rda';
import { todayLocal, dateToLocal } from '../../../lib/dates';
import { consumeNutritionDetailInitialTab } from '../utils/nutrition-detail-nav';

// ─── RDA tables now live in `data/rda.ts` (Sprint J — extracted from screen) ─

// ─── Component ────────────────────────────────────────────────────────────────

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
  // Consume the pending tab once on mount (module-level singleton).
  const initialTabRef = useRef(consumeNutritionDetailInitialTab());
  const [activeTab, setActiveTab] = useState<string>(initialTabRef.current);

  // Effective macros for the selected day (today = live, past = archive).
  const { effectiveDailyMacros, isViewingToday } = useSelectedDayMacros(
    selectedDate,
    dailyMacros,
    nutritionHistory,
  );

  // Quality metrics — uses live dailyLog (past-day aware log is a Sprint G improvement).
  const dailyQuality = computeDailyQuality({
    log: dailyLog,
    consumedFiber: effectiveDailyMacros.consumed.fiber ?? 0,
    targetFiber: effectiveDailyMacros.target.fiber,
  });

  const addCup = () => {
    if (!isViewingToday) return;
    setHydration((prev) => ({ ...prev, consumed: Math.min(prev.consumed + 1, prev.target + 5) }));
  };

  // Date pill label
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
      {/* Sticky header — sticks to top of parent <main> scroll container */}
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
        {/* Tab navigation — scrollable for narrow screens */}
        <div className="overflow-x-auto hide-scrollbar">
          <TabNav
            tabs={tabs}
            active={activeTab}
            onChange={setActiveTab}
          />
        </div>
      </div>

      {/* Tab content */}
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
            remaining={remaining}
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

        {activeTab === 'vitamins' && (
          <VitaminsTab t={t} />
        )}

        {activeTab === 'minerals' && (
          <MineralsTab t={t} />
        )}

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

// ─── Tab panels ───────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type I18nT = any;

interface SummaryTabProps {
  effectiveDailyMacros: { consumed: { cal: number; pro: number; carbs: number; fats: number }; target: { cal: number } };
  dailyQuality: ReturnType<typeof computeDailyQuality>;
  remaining: number;
  onSwitchTab: (id: string) => void;
  t: I18nT;
}

function SummaryTab({ effectiveDailyMacros, dailyQuality, remaining, onSwitchTab, t }: SummaryTabProps) {
  const score = dailyQuality.coverageScore;
  const scoreColor = score >= 70 ? 'text-primary' : score >= 40 ? 'text-tertiary' : 'text-error';

  return (
    <>
      {/* Big calorie ring */}
      <SectionCard padding="lg" spacing="md">
        <div className="flex flex-col items-center gap-3">
          <CalorieRing
            consumed={effectiveDailyMacros.consumed.cal}
            target={effectiveDailyMacros.target.cal}
            size={200}
            ariaLabel={t.home.ringAriaLabel.replace('{remaining}', String(remaining))}
            layout="consumed-target"
            consumedLabel={t.home.consumed}
            targetLabel={t.home.target}
            remainingLabel={t.home.remaining}
          />
        </div>
      </SectionCard>

      {/* 3 quick-stat tiles — value + unit on one line, label below */}
      <div className="grid grid-cols-3 gap-2">
        {[
          {
            icon: Zap,
            label: t.nutritionDetail.tabs.macros,
            display: `${effectiveDailyMacros.consumed.cal}`,
            unit: 'kcal',
            tab: 'macros',
            valueClass: 'text-primary',
          },
          {
            icon: BarChart3,
            label: t.home.protein,
            display: `${Math.round(effectiveDailyMacros.consumed.pro)}`,
            unit: 'g',
            tab: 'macros',
            valueClass: 'text-on-surface',
          },
          {
            icon: ShieldCheck,
            label: t.nutritionDetail.tabs.quality,
            display: `${score}`,
            unit: '/100',
            tab: 'quality',
            valueClass: scoreColor,
          },
        ].map(({ icon: Icon, label, display, unit, tab, valueClass }) => (
          <button
            key={tab + label}
            type="button"
            onClick={() => onSwitchTab(tab)}
            className="flex flex-col items-center gap-1.5 p-3 rounded-sm bg-surface-container-low border border-outline-variant/20 hover:bg-surface-container-highest transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <Icon className="w-4 h-4 text-on-surface-variant" aria-hidden="true" />
            <div className="flex items-baseline gap-0.5">
              <span className={`font-headline font-bold text-title-sm tabular-nums ${valueClass}`}>{display}</span>
              <span className="font-body text-micro text-on-surface-variant">{unit}</span>
            </div>
            <span className="font-label text-label font-semibold uppercase tracking-widest text-on-surface-variant text-center leading-tight">{label}</span>
          </button>
        ))}
      </div>

      {/* Personalised recommendation */}
      <SectionCard padding="md" spacing="sm">
        <Heading level="h3" variant="overline">{t.nutritionDetail.summary.recommendation}</Heading>
        <Text variant="body-sm" className="font-body text-on-surface-variant leading-relaxed">
          {t.nutritionDetail.summary.intro}
        </Text>
      </SectionCard>
    </>
  );
}

interface MacrosTabProps {
  effectiveDailyMacros: {
    consumed: { cal: number; pro: number; carbs: number; fats: number; fiber?: number };
    target: { cal: number; pro: number; carbs: number; fats: number; fiber?: number };
  };
  dailyQuality: ReturnType<typeof computeDailyQuality>;
  remaining: number;
  t: I18nT;
}

function MacrosTab({ effectiveDailyMacros, dailyQuality, t }: MacrosTabProps) {
  const macroRows = [
    { key: 'carbs',   label: t.home.carbs,   consumed: effectiveDailyMacros.consumed.carbs,         target: effectiveDailyMacros.target.carbs,         color: 'bg-macro-carbs'   },
    { key: 'protein', label: t.home.protein, consumed: effectiveDailyMacros.consumed.pro,           target: effectiveDailyMacros.target.pro,           color: 'bg-macro-protein' },
    { key: 'fats',    label: t.home.fats,    consumed: effectiveDailyMacros.consumed.fats,          target: effectiveDailyMacros.target.fats,          color: 'bg-macro-fats'    },
    { key: 'fiber',   label: t.home.fiber,   consumed: effectiveDailyMacros.consumed.fiber ?? 0,    target: effectiveDailyMacros.target.fiber ?? DEFAULT_FIBER_TARGET_G, color: 'bg-macro-fiber' },
  ];

  // Display-only extras from daily-quality (sugar / sat fat)
  const extras = [
    { key: 'sugar',        label: t.nutritionDetail.sugar,        value: dailyQuality.sugar.value,        target: dailyQuality.sugar.target,        unit: 'g', partial: dailyQuality.sugar.partial },
    { key: 'saturatedFat', label: t.nutritionDetail.saturatedFat, value: dailyQuality.saturatedFat.value, target: dailyQuality.saturatedFat.target, unit: 'g', partial: dailyQuality.saturatedFat.partial },
  ];

  return (
    <>
      <SectionCard padding="lg" spacing="md">
        <div className="space-y-6">
          {macroRows.map((m) => (
            <MacroProgressRow
              key={m.key}
              label={m.label}
              consumed={m.consumed}
              target={m.target}
              colorClassName={m.color}
              barHeight="md"
              testId={`detail-macro-${m.key}`}
            />
          ))}
        </div>
      </SectionCard>

      {/* Display-only extras */}
      <SectionCard padding="md" spacing="sm">
        <Heading level="h3" variant="overline">{t.nutritionDetail.extraSection}</Heading>
        <ul className="divide-y divide-outline-variant/10">
          {extras.map((row) => (
            <li key={row.key} className="flex items-baseline justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
              <Text variant="body-sm" className="font-body font-medium text-on-surface">
                {row.label}
              </Text>
              <Text variant="body-sm" className={`font-body tabular-nums ${row.partial ? 'italic text-on-surface-variant' : 'text-on-surface'}`}>
                {row.partial
                  ? t.nutritionDetail.notTracked
                  : `${Math.round(row.value)}${row.unit} / ${row.target}${row.unit}`}
              </Text>
            </li>
          ))}
        </ul>
      </SectionCard>
    </>
  );
}

interface VitaminsTabProps { t: I18nT }

function VitaminsTab({ t }: VitaminsTabProps) {
  const labels = t.nutritionDetail.vitaminsTab.labels as Record<VitaminKey, string>;
  return (
    <>
      <SmartInsightCard
        tone="neutral"
        message={t.nutritionDetail.vitaminsTab.placeholderBanner}
      />
      <SectionCard padding="md" spacing="sm">
        <Heading level="h3" variant="overline">{t.nutritionDetail.vitaminsTab.title}</Heading>
        <div className="divide-y divide-outline-variant/10">
          {(Object.keys(VITAMIN_RDAS) as VitaminKey[]).map((key) => (
            <NutritionRow
              key={key}
              label={labels[key] ?? key}
              consumed={null}
              rda={VITAMIN_RDAS[key].rda}
              unit={VITAMIN_RDAS[key].unit}
              rdaCaption={t.nutritionDetail.vitaminsTab.rdaCaption}
              noDataLabel={t.nutritionDetail.notTracked}
            />
          ))}
        </div>
      </SectionCard>
    </>
  );
}

interface MineralsTabProps { t: I18nT }

function MineralsTab({ t }: MineralsTabProps) {
  const labels = t.nutritionDetail.mineralsTab.labels as Record<MineralKey, string>;
  return (
    <>
      <SmartInsightCard
        tone="neutral"
        message={t.nutritionDetail.mineralsTab.placeholderBanner}
      />
      <SectionCard padding="md" spacing="sm">
        <Heading level="h3" variant="overline">{t.nutritionDetail.mineralsTab.title}</Heading>
        <div className="divide-y divide-outline-variant/10">
          {(Object.keys(MINERAL_RDAS) as MineralKey[]).map((key) => (
            <NutritionRow
              key={key}
              label={labels[key] ?? key}
              consumed={null}
              rda={MINERAL_RDAS[key].rda}
              unit={MINERAL_RDAS[key].unit}
              rdaCaption={t.nutritionDetail.vitaminsTab.rdaCaption}
              noDataLabel={t.nutritionDetail.notTracked}
            />
          ))}
        </div>
      </SectionCard>
    </>
  );
}

interface HydrationTabProps {
  hydration: { consumed: number; target: number };
  isViewingToday: boolean;
  dailyQuality: ReturnType<typeof computeDailyQuality>;
  onAddCup: () => void;
  t: I18nT;
}

function HydrationTab({ hydration, isViewingToday, dailyQuality, onAddCup, t }: HydrationTabProps) {
  // Electrolytes: sodium from quality.salt, others display-only
  const sodiumMg = Math.round(dailyQuality.salt.value * SALT_TO_SODIUM_MG_FACTOR);

  return (
    <>
      <SectionCard padding="md" spacing="md">
        <Heading level="h3" variant="overline">{t.nutritionDetail.hydrationSection}</Heading>
        <div className="flex items-center gap-3 mt-2">
          <div className="flex-1 min-w-0">
            <MacroProgressRow
              label={t.home.water}
              consumed={hydration.consumed}
              target={hydration.target}
              colorClassName="bg-primary"
              unit={` ${t.home.cups}`}
              barHeight="md"
              testId="detail-hydration-row"
            />
          </div>
          {isViewingToday && (
            <Button
              variant="outline"
              size="icon-sm"
              onClick={onAddCup}
              aria-label={t.home.addWater}
              className="shrink-0"
            >
              <Plus className="w-4 h-4" />
            </Button>
          )}
        </div>
      </SectionCard>

      {/* Electrolytes — approximate from quality data */}
      <SectionCard padding="md" spacing="sm">
        <Heading level="h3" variant="overline">{t.home.hydration?.electrolytes ?? 'Electrolitos'}</Heading>
        <ul className="divide-y divide-outline-variant/10">
          {[
            { label: t.nutritionDetail.mineralsTab.labels.sodium,    value: sodiumMg > 0 ? `${sodiumMg} mg` : '—' },
            { label: t.nutritionDetail.mineralsTab.labels.potassium, value: '—' },
            { label: t.nutritionDetail.mineralsTab.labels.magnesium, value: '—' },
          ].map((row) => (
            <li key={row.label} className="flex items-baseline justify-between py-2.5 first:pt-0 last:pb-0">
              <Text variant="body-sm" className="font-body text-on-surface">{row.label}</Text>
              <Text variant="body-sm" className="font-body tabular-nums text-on-surface-variant italic">{row.value}</Text>
            </li>
          ))}
        </ul>
      </SectionCard>
    </>
  );
}

interface PerformanceTabProps {
  onNavigateToProgress: () => void;
  t: I18nT;
}

function PerformanceTab({ onNavigateToProgress, t }: PerformanceTabProps) {
  return (
    <SectionCard padding="lg" spacing="md">
      <div className="flex flex-col items-center gap-4 py-4 text-center">
        <TrendingUp className="w-10 h-10 text-on-surface-variant" aria-hidden="true" />
        <Text variant="body-sm" className="font-body text-on-surface-variant max-w-xs mx-auto">
          {t.nutritionDetail.performanceTab.empty}
        </Text>
        <button
          type="button"
          onClick={onNavigateToProgress}
          className="flex items-center gap-2 font-body text-body-sm font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-sm"
          data-testid="view-progress-cta"
        >
          {t.nutritionDetail.performanceTab.viewProgress}
          <ChevronRight className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </SectionCard>
  );
}
