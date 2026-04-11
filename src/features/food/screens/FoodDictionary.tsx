import { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronUp, X, UtensilsCrossed, ShoppingCart, ThumbsUp, Minus, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useI18n } from '../../../i18n';
import { INGREDIENT_DICTIONARY, INGREDIENT_CATEGORIES } from '../data/ingredients';
import PortionSelector from '../components/PortionSelector';
import { getFoodQuality } from '../utils/nutrition';
import type { Ingredient, IngredientCategory } from '../../../types';
import { useAppState } from '../../../contexts/AppStateContext';
import EmptyState from '../../../components/EmptyState';

interface Props {
  navigateTo: (screen: string, data?: Record<string, unknown>) => void;
}

const CATEGORY_ORDER = Object.entries(INGREDIENT_CATEGORIES)
  .sort(([, a], [, b]) => a.order - b.order)
  .map(([key]) => key as IngredientCategory);

export default function FoodDictionary({ navigateTo }: Props) {
  const { t, locale } = useI18n();
  const { userProfile } = useAppState();
  const unitSystem = userProfile.unitSystem ?? 'metric';
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<IngredientCategory | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let items = INGREDIENT_DICTIONARY;

    if (activeCategory) {
      items = items.filter(i => i.category === activeCategory);
    }

    if (query.trim()) {
      const q = query.toLowerCase().trim();
      items = items.filter(i =>
        i.name.toLowerCase().includes(q) ||
        i.nameEn.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        i.tags.some(tag => tag.includes(q)),
      );
    }

    return items;
  }, [query, activeCategory]);

  // Group by category for display
  const grouped = useMemo(() => {
    const map = new Map<IngredientCategory, Ingredient[]>();
    for (const item of filtered) {
      const list = map.get(item.category) ?? [];
      list.push(item);
      map.set(item.category, list);
    }
    // Sort categories by defined order
    return CATEGORY_ORDER
      .filter(cat => map.has(cat))
      .map(cat => ({ category: cat, items: map.get(cat)! }));
  }, [filtered]);

  const toggleExpand = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  return (
    <div className="px-4 md:px-6 max-w-4xl mx-auto pb-24 space-y-4">
      {/* Title */}
      <h2 className="font-headline text-3xl md:text-4xl font-bold tracking-tighter uppercase text-tertiary">
        {t.foodDictionary.title}
      </h2>

      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={t.foodDictionary.searchPlaceholder}
          className="w-full pl-10 pr-10 py-3 bg-surface-container-low border border-outline-variant/30 rounded-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary transition-colors"
        />
        {query && (
          <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Category chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-none">
        <button
          onClick={() => setActiveCategory(null)}
          className={`shrink-0 px-3 py-1.5 rounded-sm text-xs font-headline font-bold uppercase tracking-widest transition-colors ${
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
              key={cat}
              onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
              className={`shrink-0 px-3 py-1.5 rounded-sm text-xs font-headline font-bold uppercase tracking-widest transition-colors ${
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

      {/* Results count */}
      <p className="text-xs text-on-surface-variant font-label tracking-wide">
        {(filtered.length === 1 ? t.foodDictionary.foodCountOne : t.foodDictionary.foodCount).replace('{count}', String(filtered.length))}
      </p>

      {/* Grouped list */}
      {grouped.length === 0 ? (
        <EmptyState icon="🔍" title={t.foodDictionary.noResults} description={t.foodDictionary.tryAnother} />
      ) : (
        grouped.map(group => {
          const meta = INGREDIENT_CATEGORIES[group.category];
          return (
            <section key={group.category} className="space-y-2">
              <h3 className="font-headline font-bold text-sm uppercase tracking-widest text-on-surface-variant flex items-center gap-2 pt-2">
                <span>{meta.icon}</span>
                <span>{locale === 'es' ? meta.name : meta.nameEn}</span>
                <span className="text-[10px] font-label text-on-surface-variant/60">{group.items.length}</span>
              </h3>

              <div className="space-y-1">
                {group.items.map(item => {
                  const isExpanded = expandedId === item.id;
                  const quality = getFoodQuality(item.macros);
                  const QualityIcon = quality === 'good' ? ThumbsUp : quality === 'poor' ? AlertTriangle : Minus;
                  const qualityColor = quality === 'good' ? 'text-primary' : quality === 'poor' ? 'text-error' : 'text-brand-secondary';

                  return (
                    <div key={item.id} className="bg-surface-container-low rounded-sm border border-outline-variant/20 overflow-hidden">
                      {/* Collapsed row */}
                      <button
                        onClick={() => toggleExpand(item.id)}
                        className="w-full flex items-center p-3 text-left hover:bg-surface-container-highest/50 transition-colors"
                      >
                        <QualityIcon className={`w-4 h-4 mr-2.5 shrink-0 ${qualityColor}`} />
                        <div className="flex-1 min-w-0">
                          <span className="font-headline font-bold text-sm text-on-surface block truncate">
                            {locale === 'es' ? item.name : item.nameEn}
                          </span>
                          <span className="text-[10px] font-label text-on-surface-variant tracking-wide">
                            {item.macros.calories} kcal · {item.macros.protein}g pro · {item.macros.carbs}g carbs · {item.macros.fats}g fat
                          </span>
                        </div>
                        {item.tags.length > 0 && (
                          <Badge variant="outline" className="mr-2 shrink-0 hidden sm:inline-flex">
                            {item.tags[0]}
                          </Badge>
                        )}
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-on-surface-variant shrink-0" /> : <ChevronDown className="w-4 h-4 text-on-surface-variant shrink-0" />}
                      </button>

                      {/* Expanded detail */}
                      {isExpanded && (
                        <div className="px-3 pb-4 pt-1 space-y-4 border-t border-outline-variant/20">
                          {/* Description */}
                          <p className="text-sm text-on-surface-variant">
                            {locale === 'es' ? item.description : item.descriptionEn}
                          </p>

                          {/* Tags */}
                          {item.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {item.tags.map(tag => (
                                <Badge key={tag} variant="secondary" className="text-[8px]">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}

                          {/* Allergens */}
                          {item.allergens.length > 0 && (
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] font-label uppercase tracking-widest text-on-surface-variant">{t.foodDictionary.allergens}:</span>
                              {item.allergens.map(a => (
                                <Badge key={a} variant="destructive" className="text-[8px]">
                                  {a}
                                </Badge>
                              ))}
                            </div>
                          )}

                          {/* Portion selector */}
                          <div className="space-y-2">
                            <h4 className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant">
                              {t.foodDictionary.servings}
                            </h4>
                            <PortionSelector ingredient={item} unitSystem={unitSystem} />
                          </div>

                          {/* Micronutrient highlights */}
                          <MicroHighlights item={item} />

                          {/* CTAs */}
                          <div className="flex gap-2">
                            <Button
                              variant="brand"
                              size="sm"
                              className="flex-1"
                              onClick={() => navigateTo('add-meal', { prefillIngredient: item.id })}
                            >
                              <UtensilsCrossed className="w-3.5 h-3.5 mr-1.5" />
                              {t.portionSelector.addToMeal}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => navigateTo('create-recipe', { prefillIngredient: item.id })}
                            >
                              <ShoppingCart className="w-3.5 h-3.5 mr-1.5" />
                              {t.portionSelector.addToRecipe}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })
      )}
    </div>
  );
}

// ── Micro highlights ──────────────────────────
function MicroHighlights({ item }: { item: Ingredient }) {
  const { t } = useI18n();
  const highlights: { label: string; value: string }[] = [];
  const { vitamins, minerals } = item.micros;

  if (vitamins.vitaminC && vitamins.vitaminC > 10) highlights.push({ label: 'Vit C', value: `${vitamins.vitaminC}mg` });
  if (vitamins.vitaminA && vitamins.vitaminA > 100) highlights.push({ label: 'Vit A', value: `${vitamins.vitaminA}mcg` });
  if (vitamins.vitaminD && vitamins.vitaminD > 2) highlights.push({ label: 'Vit D', value: `${vitamins.vitaminD}mcg` });
  if (vitamins.vitaminB12 && vitamins.vitaminB12 > 1) highlights.push({ label: 'B12', value: `${vitamins.vitaminB12}mcg` });
  if (vitamins.folate && vitamins.folate > 30) highlights.push({ label: 'Folato', value: `${vitamins.folate}mcg` });
  if (minerals.iron && minerals.iron > 1) highlights.push({ label: 'Hierro', value: `${minerals.iron}mg` });
  if (minerals.calcium && minerals.calcium > 50) highlights.push({ label: 'Calcio', value: `${minerals.calcium}mg` });
  if (minerals.potassium && minerals.potassium > 200) highlights.push({ label: 'Potasio', value: `${minerals.potassium}mg` });
  if (minerals.magnesium && minerals.magnesium > 30) highlights.push({ label: 'Magnesio', value: `${minerals.magnesium}mg` });
  if (minerals.zinc && minerals.zinc > 2) highlights.push({ label: 'Zinc', value: `${minerals.zinc}mg` });
  if (minerals.selenium && minerals.selenium > 10) highlights.push({ label: 'Selenio', value: `${minerals.selenium}mcg` });

  if (highlights.length === 0) return null;

  return (
    <div className="space-y-1">
      <h4 className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant">
        {t.foodDictionary.highlightedMicros}
      </h4>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-1">
        {highlights.slice(0, 8).map(h => (
          <div key={h.label} className="bg-surface-container-highest rounded-sm px-2 py-1 text-center">
            <span className="block text-xs font-bold text-on-surface">{h.value}</span>
            <span className="text-[8px] font-label uppercase tracking-wider text-on-surface-variant">{h.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
