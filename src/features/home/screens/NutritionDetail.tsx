/**
 * NutritionDetail — extended nutrition view (post-1.5.186).
 *
 * Reachable from Home advanced via the "Ver detalle nutricional" CTA on the
 * macros card. Shows everything that doesn't fit on the Home hero:
 *   - Calorie ring (bigger) + consumed/target/remaining headline
 *   - 4 macro rows (carbs, protein, fats, fiber) with bigger bars
 *   - Hydration row with cup tap-to-add
 *   - Other-nutrients section (sugar/sodium/sat fat) — display-only,
 *     marked "not tracked" until per-entry micronutrient summing lands
 *   - Weekly trend link → Progress screen
 */
import { useState } from 'react';
import { ChevronRight, Plus, ChevronDown } from 'lucide-react';
import PageShell from '../../../components/PageShell';
import PageHeader from '../../../components/patterns/PageHeader';
import SectionCard from '../../../components/SectionCard';
import { Heading, Text } from '../../../components/ui/Typography';
import { Button } from '@/components/ui/button';
import { useI18n } from '../../../i18n';
import { useAppState } from '../../../contexts/AppStateContext';
import { useNavigation } from '../../../contexts/NavigationContext';
import { CalorieRing } from '../components/NutritionHeroRing';
import MacroProgressRow from '../components/MacroProgressRow';
import DatePickerSheet from '../components/DatePickerSheet';
import { useSelectedDayMacros } from '../hooks/useSelectedDayMacros';
import { todayLocal, dateToLocal } from '../../../lib/dates';

export default function NutritionDetail({ onBack }: { onBack: () => void }) {
  const { t, locale } = useI18n();
  const { navigateTo } = useNavigation();
  const {
    dailyMacros,
    hydration,
    setHydration,
    nutritionHistory,
    selectedDate,
    setSelectedDate,
  } = useAppState();
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  // Sprint B3: same selectedDate as Home → effective macros swap by selected day.
  const { effectiveDailyMacros, isViewingToday } = useSelectedDayMacros(
    selectedDate,
    dailyMacros,
    nutritionHistory,
  );

  const consumedPct = effectiveDailyMacros.target.cal > 0
    ? Math.round((Math.max(0, effectiveDailyMacros.consumed.cal) / effectiveDailyMacros.target.cal) * 100)
    : 0;
  const remaining = Math.max(0, effectiveDailyMacros.target.cal - effectiveDailyMacros.consumed.cal);

  const macroRows = [
    {
      key: 'carbs',
      label: t.home.carbs,
      consumed: effectiveDailyMacros.consumed.carbs,
      target: effectiveDailyMacros.target.carbs,
      colorClassName: 'bg-macro-carbs',
    },
    {
      key: 'protein',
      label: t.home.protein,
      consumed: effectiveDailyMacros.consumed.pro,
      target: effectiveDailyMacros.target.pro,
      colorClassName: 'bg-macro-protein',
    },
    {
      key: 'fats',
      label: t.home.fats,
      consumed: effectiveDailyMacros.consumed.fats,
      target: effectiveDailyMacros.target.fats,
      colorClassName: 'bg-macro-fats',
    },
    {
      key: 'fiber',
      label: t.home.fiber,
      consumed: effectiveDailyMacros.consumed.fiber ?? 0,
      target: effectiveDailyMacros.target.fiber ?? 30,
      colorClassName: 'bg-macro-fiber',
    },
  ];

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

  return (
    <PageShell spacing="lg">
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

      {/* Hero — bigger ring (the corner labels INSIDE the ring already cover consumed/target). */}
      <SectionCard padding="lg" spacing="md">
        <div className="flex flex-col items-center gap-2">
          <CalorieRing
            consumed={effectiveDailyMacros.consumed.cal}
            target={effectiveDailyMacros.target.cal}
            size={224}
            ariaLabel={t.home.ringAriaLabel.replace('{remaining}', String(remaining))}
            layout="consumed-target"
            consumedLabel={t.home.consumed}
            targetLabel={t.home.target}
            remainingLabel={t.home.remaining}
          />
          <div className="font-headline font-bold text-title-sm text-primary tabular-nums">
            {consumedPct}%
          </div>
        </div>
      </SectionCard>

      {/* Macros */}
      <section className="space-y-3">
        <Heading level="h3" className="normal-case tracking-normal text-on-surface">
          {t.nutritionDetail.macrosSection}
        </Heading>
        <SectionCard padding="lg" spacing="md">
          <div className="space-y-6">
            {macroRows.map((m) => (
              <MacroProgressRow
                key={m.key}
                label={m.label}
                consumed={m.consumed}
                target={m.target}
                colorClassName={m.colorClassName}
                barHeight="md"
                testId={`detail-macro-${m.key}`}
              />
            ))}
          </div>
        </SectionCard>
      </section>

      {/* Hydration — same MacroProgressRow shape for visual consistency with Macros card. */}
      <section className="space-y-3">
        <Heading level="h3" className="normal-case tracking-normal text-on-surface">
          {t.nutritionDetail.hydrationSection}
        </Heading>
        <SectionCard padding="lg" spacing="md">
          <div className="flex items-center gap-3">
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
            <Button
              variant="outline"
              size="icon-sm"
              onClick={addCup}
              aria-label={t.home.addWater}
              className="shrink-0"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </SectionCard>
      </section>

      {/* Other nutrients — display-only placeholder until per-entry micros sum lands */}
      <section className="space-y-3">
        <Heading level="h3" className="normal-case tracking-normal text-on-surface">
          {t.nutritionDetail.extraSection}
        </Heading>
        <SectionCard padding="lg" spacing="md">
          <ul className="divide-y divide-outline-variant/20">
            {[
              { label: t.nutritionDetail.sugar, recommended: '50', unit: 'g' },
              { label: t.nutritionDetail.sodium, recommended: '2300', unit: 'mg' },
              { label: t.nutritionDetail.saturatedFat, recommended: '20', unit: 'g' },
            ].map((row) => (
              <li key={row.label} className="flex items-baseline justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <div className="flex flex-col gap-0.5">
                  <Text variant="body-sm" className="font-body font-semibold text-on-surface">
                    {row.label}
                  </Text>
                  <Text variant="body-sm" className="font-body text-on-surface-variant">
                    {t.nutritionDetail.recommendedDaily.replace('{n}', row.recommended).replace('{unit}', row.unit)}
                  </Text>
                </div>
                <Text variant="body-sm" className="font-body italic text-on-surface-variant text-right">
                  {t.nutritionDetail.notTracked}
                </Text>
              </li>
            ))}
          </ul>
        </SectionCard>
      </section>

      {/* Weekly trend link */}
      <button
        type="button"
        onClick={() => navigateTo('progress')}
        className="w-full flex items-center justify-between px-4 py-3 rounded-sm bg-surface-container-low border border-outline-variant/20 hover:bg-surface-container-highest transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        data-testid="nutrition-detail-weekly-link"
      >
        <Text variant="body-sm" className="font-body font-semibold text-primary">
          {t.nutritionDetail.weeklyLink}
        </Text>
        <ChevronRight className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
      </button>

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
