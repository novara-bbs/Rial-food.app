/**
 * P8 `[1.5.65]` — educational detail screen for a FoodFamily.
 *
 * Owner directive (2026-04-21): the Diccionario is a real differentiator — not
 * to be collapsed. This screen gives each family a dedicated, learning-oriented
 * page with image hero, long educational description, culinary contexts,
 * curated substitutes and full variant list. It coexists with the
 * personalization flows (P11+) which will live in separate entry points.
 *
 * Contract:
 *  - `familyId` arrives via `useNavigation().screenData`. Invalid / missing id
 *    renders a graceful empty-state with a back button — never throws.
 *  - Rendering degrades gracefully when a family has no curated content:
 *    `longDescription` falls back to the short `description`; `culinaryUses`
 *    and `substitutes` sections simply don't render when empty.
 *  - Substitute rows are tappable and navigate to the target family's detail
 *    (stackable education path — a user can drill through «¿Sin aguacate?
 *    Hummus» → «¿Sin hummus? Crema de almendra» without leaving the concept).
 *  - CTAs route to AddMeal (logging) and CreateRecipe (recipe building). Neither
 *    tries to pre-fill state beyond the family id — intentionally light
 *    coupling.
 */
import { useMemo } from 'react';
import { ChevronRight } from 'lucide-react';
import { useI18n } from '../../../i18n';
import { useNavigation } from '../../../contexts/NavigationContext';
import PageShell from '../../../components/PageShell';
import PageHeader from '../../../components/patterns/PageHeader';
import SectionCard from '../../../components/SectionCard';
import type { FoodFamily, FoodVariant } from '../../../types/food-family';
import { FOOD_FAMILIES } from '../data/food-families';
import {
  computeMacroDelta,
  getVariantsOfFamily,
  resolveVariant,
} from '../utils/food-family-resolver';
import VariantRow from '../components/VariantRow';
import TierBadge from '../components/TierBadge';
import { deriveTier } from '../utils/trust-tier';
import ContextualScorePanel from '../components/ContextualScorePanel';
import { normalizeGoal } from '../utils/contextual-score';
import { useAppState } from '../../../contexts/AppStateContext';

export default function FoodDetail() {
  const { t, locale } = useI18n();
  const { navigateTo, goBack, screenData } = useNavigation();
  const { userProfile } = useAppState();
  const activeGoal = normalizeGoal(
    typeof (userProfile as { goal?: string })?.goal === 'string'
      ? (userProfile as { goal?: string }).goal
      : null,
  );

  const familyId = (screenData?.familyId as string | undefined) ?? '';
  const family: FoodFamily | undefined = useMemo(
    () => FOOD_FAMILIES.find(f => f.id === familyId),
    [familyId],
  );

  if (!family) {
    return (
      <PageShell maxWidth="default" spacing="md">
        <PageHeader
          onBack={goBack}
          label=""
          title={t.foodDictionary.title}
        />
        <SectionCard>
          <p className="text-body text-on-surface-variant">
            {t.common.noResults}
          </p>
        </SectionCard>
      </PageShell>
    );
  }

  const canonical = resolveVariant(family.id);
  const variants = getVariantsOfFamily(family.id);
  const displayName = locale === 'es' ? family.name : family.nameEn;
  const longDescription = family.longDescription
    ? (locale === 'es' ? family.longDescription.es : family.longDescription.en)
    : (locale === 'es' ? family.description : family.descriptionEn);
  const culinaryUseLabels = t.foodDictionary.culinaryUseLabels as Record<string, string>;
  const substituteReasons = t.foodDictionary.substituteReasons as Record<string, string>;

  const handleSubstituteTap = (targetFamilyId: string) => {
    navigateTo('food-detail', { familyId: targetFamilyId });
  };

  return (
    <PageShell maxWidth="default" spacing="md">
      <PageHeader onBack={goBack} label="" title={displayName} />

      {/* Hero — image + canonical macros */}
      <SectionCard>
        <div className="flex items-center gap-4">
          <span
            aria-hidden="true"
            className="text-6xl leading-none shrink-0 select-none"
          >
            {family.image ?? '🍽️'}
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="font-headline font-bold text-title-sm text-on-surface truncate">
              {displayName}
            </h3>
            {canonical && (
              <>
                <p className="mt-1 text-micro font-label uppercase tracking-widest text-on-surface-variant">
                  {canonical.macros.calories} {t.common.kcal} ·{' '}
                  {canonical.macros.protein}g P · {canonical.macros.carbs}g C ·{' '}
                  {canonical.macros.fats}g G
                </p>
                <span className="mt-1.5 inline-flex items-center gap-1.5">
                  <TierBadge tier={deriveTier(canonical)} />
                </span>
              </>
            )}
          </div>
        </div>
      </SectionCard>

      {/* What is it? — long educational description */}
      {longDescription && (
        <SectionCard title={t.foodDictionary.foodDetail.whatIsIt}>
          <p className="text-body text-on-surface leading-relaxed whitespace-pre-line">
            {longDescription}
          </p>
        </SectionCard>
      )}

      {/* P9 — contextual 3-goal score panel. Requires a canonical variant. */}
      {canonical && (
        <SectionCard title={t.contextualScore.whichGoalIsBetter}>
          <ContextualScorePanel variant={canonical} activeGoal={activeGoal} />
        </SectionCard>
      )}

      {/* Culinary uses */}
      {family.culinaryUses && family.culinaryUses.length > 0 && (
        <SectionCard title={t.foodDictionary.foodDetail.usedFor}>
          <div data-culinary-uses className="flex flex-wrap gap-1.5">
            {family.culinaryUses.map(slug => (
              <span
                key={slug}
                data-use-slug={slug}
                className="text-caption text-on-surface bg-surface-container-high rounded-full px-2.5 py-1"
              >
                {culinaryUseLabels[slug] ?? slug}
              </span>
            ))}
          </div>
        </SectionCard>
      )}

      {/* Substitutes */}
      {family.substitutes && family.substitutes.length > 0 && (
        <SectionCard title={t.foodDictionary.foodDetail.substituteFor}>
          <ul className="flex flex-col gap-1.5">
            {family.substitutes.map((ref) => {
              const target = FOOD_FAMILIES.find(f => f.id === ref.familyId);
              if (!target) return null;
              const targetName = locale === 'es' ? target.name : target.nameEn;
              return (
                <li key={ref.familyId}>
                  <button
                    type="button"
                    onClick={() => handleSubstituteTap(ref.familyId)}
                    className="w-full flex items-center justify-between gap-3 p-3 bg-surface-container-low rounded-sm hover:bg-surface-container-high focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-colors"
                  >
                    <span className="flex items-center gap-3 min-w-0">
                      <span aria-hidden="true" className="text-3xl leading-none select-none">
                        {target.image ?? '🍽️'}
                      </span>
                      <span className="min-w-0 text-left">
                        <span className="block font-headline font-bold text-body-sm text-on-surface truncate">
                          {targetName}
                        </span>
                        <span className="block text-micro font-label uppercase tracking-widest text-on-surface-variant">
                          {substituteReasons[ref.reason] ?? ref.reason}
                        </span>
                      </span>
                    </span>
                    <ChevronRight
                      aria-hidden="true"
                      className="w-4 h-4 text-on-surface-variant shrink-0"
                    />
                  </button>
                </li>
              );
            })}
          </ul>
        </SectionCard>
      )}

      {/* Variants list */}
      {variants.length > 1 && (
        <SectionCard title={t.foodDictionary.foodDetail.variants}>
          <div className="flex flex-col gap-1.5">
            {variants
              .filter(v => v.id !== family.canonicalVariantId)
              .map((v: FoodVariant) => (
                <VariantRow
                  key={v.id}
                  variant={v}
                  delta={computeMacroDelta(v)}
                />
              ))}
          </div>
        </SectionCard>
      )}

      {/* CTAs */}
      <SectionCard>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => navigateTo('add-meal')}
            className="w-full min-h-11 bg-primary text-on-primary font-headline font-bold text-body-sm uppercase tracking-widest rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-colors hover:bg-primary/90"
          >
            {t.foodDictionary.foodDetail.addToDiary}
          </button>
          <button
            type="button"
            onClick={() => navigateTo('create-recipe')}
            className="w-full min-h-11 bg-surface-container-high text-on-surface font-headline font-bold text-body-sm uppercase tracking-widest rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-colors hover:bg-surface-container"
          >
            {t.foodDictionary.foodDetail.useInRecipe}
          </button>
        </div>
      </SectionCard>
    </PageShell>
  );
}
