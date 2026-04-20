import { useState, useMemo } from 'react';
import PageShell from '../../../components/PageShell';
import { UtensilsCrossed, ShoppingCart, X } from 'lucide-react';
import SearchInput from '../../../components/patterns/SearchInput';
import PageHeader from '../../../components/patterns/PageHeader';
import { Button } from '@/components/ui/button';
import { useI18n } from '../../../i18n';
import { INGREDIENT_DICTIONARY, INGREDIENT_CATEGORIES } from '../data/ingredients';
import { FOOD_FAMILIES } from '../data/food-families';
import {
  getVariantsOfFamily,
  getCanonicalVariant,
  resolveVariant,
} from '../utils/food-family-resolver';
import PortionSelector from '../components/PortionSelector';
import FamilyCard from '../components/FamilyCard';
import GlossaryButton from '../components/GlossaryButton';
import type { IngredientCategory, Allergen, Ingredient } from '../../../types';
import type { FoodFamily, FoodVariant } from '../../../types/food-family';
import { useAppState } from '../../../contexts/AppStateContext';
import EmptyState from '../../../components/EmptyState';
import {
  groupFamiliesBySubcategory,
  sortSubcategoriesByOrder,
  groupFamiliesBySpecies,
} from '../utils/group-by-subcategory';

const ALL_ALLERGENS: Allergen[] = [
  'gluten', 'dairy', 'eggs', 'nuts', 'peanuts',
  'soy', 'fish', 'shellfish', 'sesame', 'celery',
  'mustard', 'sulfites',
];

interface Props {
  navigateTo: (screen: string, data?: Record<string, unknown>) => void;
}

const CATEGORY_ORDER = Object.entries(INGREDIENT_CATEGORIES)
  .sort(([, a], [, b]) => a.order - b.order)
  .map(([key]) => key as IngredientCategory);

// Variants share ids with the legacy Ingredient dictionary, so consumers that
// still take `Ingredient` (PortionSelector, MicroHighlights) resolve by lookup.
const INGREDIENT_BY_ID: Record<string, Ingredient> = Object.fromEntries(
  INGREDIENT_DICTIONARY.map(i => [i.id, i]),
);

export default function FoodDictionary({ navigateTo }: Props) {
  const { t, locale } = useI18n();
  const { userProfile } = useAppState();
  const unitSystem = userProfile.unitSystem ?? 'metric';
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<IngredientCategory | null>(null);
  const [expandedFamilyId, setExpandedFamilyId] = useState<string | null>(null);
  const [excludedAllergens, setExcludedAllergens] = useState<Set<Allergen>>(new Set());
  const [selectedByFamily, setSelectedByFamily] = useState<Record<string, string>>({});

  const toggleAllergen = (a: Allergen) => {
    setExcludedAllergens(prev => {
      const next = new Set(prev);
      if (next.has(a)) next.delete(a); else next.add(a);
      return next;
    });
  };

  const filteredFamilies = useMemo(() => {
    const q = query.toLowerCase().trim();
    return FOOD_FAMILIES.filter(family => {
      if (activeCategory && family.category !== activeCategory) return false;

      // Allergen filter: family passes if at least one variant has no excluded allergen
      if (excludedAllergens.size > 0) {
        const variants = getVariantsOfFamily(family.id);
        const anyClean = variants.some(v => !v.allergens.some(a => excludedAllergens.has(a)));
        if (!anyClean) return false;
      }

      if (!q) return true;
      if (family.name.toLowerCase().includes(q)) return true;
      if (family.nameEn.toLowerCase().includes(q)) return true;
      if (family.description.toLowerCase().includes(q)) return true;
      if (family.descriptionEn.toLowerCase().includes(q)) return true;
      if (family.aliases?.some(a => a.toLowerCase().includes(q))) return true;
      const variants = getVariantsOfFamily(family.id);
      return variants.some(v =>
        v.name.toLowerCase().includes(q) ||
        v.nameEn.toLowerCase().includes(q) ||
        v.tags?.some(tag => tag.includes(q)),
      );
    });
  }, [query, activeCategory, excludedAllergens]);

  const grouped = useMemo(() => {
    const map = new Map<IngredientCategory, FoodFamily[]>();
    for (const family of filteredFamilies) {
      const list = map.get(family.category) ?? [];
      list.push(family);
      map.set(family.category, list);
    }
    return CATEGORY_ORDER
      .filter(cat => map.has(cat))
      .map(cat => {
        const families = map.get(cat)!;
        // P2.5: bucket by subcategory → ordered groups; null-bucket (families
        // without subcategory) renders flat under the category header.
        const subGroups = sortSubcategoriesByOrder(
          groupFamiliesBySubcategory(families),
          cat,
        );
        return { category: cat, families, subGroups };
      });
  }, [filteredFamilies]);

  const toggleExpand = (id: string) => {
    setExpandedFamilyId(prev => prev === id ? null : id);
  };

  const handleSelectVariant = (familyId: string, variant: FoodVariant) => {
    setSelectedByFamily(prev => ({ ...prev, [familyId]: variant.id }));
  };

  return (
    <PageShell maxWidth="default" spacing="md">
      <PageHeader onBack={() => navigateTo('more')} label="" title={t.foodDictionary.title} />

      <SearchInput
        value={query}
        onChange={setQuery}
        placeholder={t.foodDictionary.searchPlaceholder}
        onClear={() => setQuery('')}
      />

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveCategory(null)}
          className={`shrink-0 px-3 py-1.5 rounded-sm text-label font-headline font-bold uppercase tracking-widest transition-colors ${
            activeCategory === null
              ? 'bg-primary text-on-primary'
              : 'bg-surface-container-highest text-on-surface-variant hover:bg-surface-container-high'
          }`}
        >
          {t.foodDictionary.allCategories}
        </button>
        {CATEGORY_ORDER.map(cat => {
          const meta = INGREDIENT_CATEGORIES[cat];
          return (
            <button
              type="button"
              key={cat}
              onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
              className={`shrink-0 px-3 py-1.5 rounded-sm text-label font-headline font-bold uppercase tracking-widest transition-colors ${
                activeCategory === cat
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container-highest text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              {meta.icon} {locale === 'es' ? meta.name : meta.nameEn}
            </button>
          );
        })}
      </div>

      <div className="space-y-1.5">
        <span id="allergen-filter-label" className="text-micro font-label uppercase tracking-widest text-on-surface-variant">
          {t.foodDictionary.allergenFilter}
        </span>
        <div role="group" aria-labelledby="allergen-filter-label" className="flex gap-1.5 flex-wrap">
          {ALL_ALLERGENS.map(a => {
            const active = excludedAllergens.has(a);
            const label = t.foodDictionary.allergenLabels[a];
            return (
              <button
                type="button"
                key={a}
                aria-pressed={active}
                onClick={() => toggleAllergen(a)}
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-sm text-micro font-headline font-bold uppercase tracking-widest transition-colors ${
                  active
                    ? 'bg-error/15 text-error border border-error/30'
                    : 'bg-surface-container-highest text-on-surface-variant border border-transparent hover:bg-surface-container-high'
                }`}
              >
                {active && <X className="w-3 h-3" aria-hidden="true" />}
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <p className="text-label text-on-surface-variant font-label tracking-widest uppercase">
        {(filteredFamilies.length === 1 ? t.foodDictionary.foodCountOne : t.foodDictionary.foodCount).replace('{count}', String(filteredFamilies.length))}
      </p>

      {grouped.length === 0 ? (
        <EmptyState icon="🔍" title={t.foodDictionary.noResults} description={t.foodDictionary.tryAnother} />
      ) : (
        grouped.map(group => {
          const meta = INGREDIENT_CATEGORIES[group.category];
          const subcategoryLabels = t.foodDictionary.subcategoryLabels as Record<string, string>;
          const renderFamily = (family: FoodFamily) => {
            const canonical = getCanonicalVariant(family.id);
            if (!canonical) return null;
            const variants = getVariantsOfFamily(family.id);
            const selectedVariantId = selectedByFamily[family.id];
            const activeVariant = resolveVariant(family.id, selectedVariantId) ?? canonical;
            const activeIngredient = INGREDIENT_BY_ID[activeVariant.id];

            return (
              <FamilyCard
                key={family.id}
                family={family}
                canonicalVariant={canonical}
                variants={variants}
                expanded={expandedFamilyId === family.id}
                onToggle={() => toggleExpand(family.id)}
                selectedVariantId={selectedVariantId}
                onSelectVariant={v => handleSelectVariant(family.id, v)}
                onLearnMore={() => navigateTo('food-detail', { familyId: family.id })}
                portionSlot={
                  activeIngredient && (
                    <div className="space-y-2">
                      <h4 className="text-micro font-label uppercase tracking-widest text-on-surface-variant">
                        {t.foodDictionary.servings}
                      </h4>
                      <PortionSelector ingredient={activeIngredient} unitSystem={unitSystem} />
                    </div>
                  )
                }
                microSlot={activeIngredient && <MicroHighlights item={activeIngredient} />}
                ctaSlot={
                  <div className="flex gap-2">
                    <Button
                      variant="brand"
                      size="sm"
                      className="flex-1"
                      onClick={() => navigateTo('add-meal')}
                    >
                      <UtensilsCrossed className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" />
                      {t.portionSelector.addToMeal}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => navigateTo('create-recipe')}
                    >
                      <ShoppingCart className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" />
                      {t.portionSelector.addToRecipe}
                    </Button>
                  </div>
                }
              />
            );
          };

          return (
            <section key={group.category} className="space-y-2">
              <h3 className="font-headline font-bold text-body-sm uppercase tracking-widest text-on-surface-variant flex items-center gap-2 pt-2">
                <span aria-hidden="true">{meta.icon}</span>
                <span>{locale === 'es' ? meta.name : meta.nameEn}</span>
                <span className="text-micro font-label text-on-surface-variant/60">{group.families.length}</span>
              </h3>

              {group.subGroups.map(sub => {
                const speciesLabels = t.foodDictionary.speciesLabels as Record<string, string>;
                const speciesBuckets = groupFamiliesBySpecies(sub.families);
                return (
                  <div key={sub.subcategoryKey ?? '__flat__'} className="space-y-1">
                    {sub.subcategoryKey !== null && (
                      <h4
                        data-subcategory={sub.subcategoryKey}
                        className="text-label font-label uppercase tracking-widest text-on-surface-variant flex items-center gap-2 pt-1"
                      >
                        <span>{subcategoryLabels[sub.subcategoryKey] ?? sub.subcategoryKey}</span>
                        <GlossaryButton
                          slug={sub.subcategoryKey}
                          label={subcategoryLabels[sub.subcategoryKey] ?? sub.subcategoryKey}
                        />
                        <span className="text-micro font-label text-on-surface-variant/60">{sub.families.length}</span>
                      </h4>
                    )}
                    {/* Flat families first (no species OR single-family species). */}
                    {speciesBuckets.flat.map(renderFamily)}
                    {/* Species subheaders for multi-family species (P7 B). */}
                    {speciesBuckets.groups.map(g => (
                      <div key={g.speciesKey} className="space-y-1">
                        <h5
                          data-species={g.speciesKey}
                          className="text-micro font-label uppercase tracking-widest text-on-surface-variant/80 flex items-center gap-2 pt-0.5 pl-1"
                        >
                          <span aria-hidden="true" className="inline-block w-1 h-1 rounded-full bg-primary/60" />
                          <span>{speciesLabels[g.speciesKey] ?? g.speciesKey}</span>
                          <span className="text-on-surface-variant/60">{g.families.length}</span>
                        </h5>
                        {g.families.map(renderFamily)}
                      </div>
                    ))}
                  </div>
                );
              })}
            </section>
          );
        })
      )}
    </PageShell>
  );
}

// ── Micro highlights ──────────────────────────
function MicroHighlights({ item }: { item: Ingredient }) {
  const { t } = useI18n();
  const labels = t.foodDictionary.microLabels;
  const highlights: { label: string; value: string }[] = [];
  const { vitamins, minerals } = item.micros;

  if (vitamins.vitaminC && vitamins.vitaminC > 10) highlights.push({ label: labels.vitC, value: `${vitamins.vitaminC}mg` });
  if (vitamins.vitaminA && vitamins.vitaminA > 100) highlights.push({ label: labels.vitA, value: `${vitamins.vitaminA}mcg` });
  if (vitamins.vitaminD && vitamins.vitaminD > 2) highlights.push({ label: labels.vitD, value: `${vitamins.vitaminD}mcg` });
  if (vitamins.vitaminB12 && vitamins.vitaminB12 > 1) highlights.push({ label: labels.vitB12, value: `${vitamins.vitaminB12}mcg` });
  if (vitamins.folate && vitamins.folate > 30) highlights.push({ label: labels.folate, value: `${vitamins.folate}mcg` });
  if (minerals.iron && minerals.iron > 1) highlights.push({ label: labels.iron, value: `${minerals.iron}mg` });
  if (minerals.calcium && minerals.calcium > 50) highlights.push({ label: labels.calcium, value: `${minerals.calcium}mg` });
  if (minerals.potassium && minerals.potassium > 200) highlights.push({ label: labels.potassium, value: `${minerals.potassium}mg` });
  if (minerals.magnesium && minerals.magnesium > 30) highlights.push({ label: labels.magnesium, value: `${minerals.magnesium}mg` });
  if (minerals.zinc && minerals.zinc > 2) highlights.push({ label: labels.zinc, value: `${minerals.zinc}mg` });
  if (minerals.selenium && minerals.selenium > 10) highlights.push({ label: labels.selenium, value: `${minerals.selenium}mcg` });

  if (highlights.length === 0) return null;

  return (
    <div className="space-y-1">
      <h4 className="text-micro font-label uppercase tracking-widest text-on-surface-variant">
        {t.foodDictionary.highlightedMicros}
      </h4>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-1">
        {highlights.slice(0, 8).map(h => (
          <div key={h.label} className="bg-surface-container-highest rounded-sm px-2 py-1 text-center">
            <span className="block text-label font-bold text-on-surface">{h.value}</span>
            <span className="text-micro font-label uppercase tracking-wider text-on-surface-variant">{h.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
