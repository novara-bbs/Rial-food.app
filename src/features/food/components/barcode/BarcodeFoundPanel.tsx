import { CheckCircle2, Info, Save, RotateCcw, UtensilsCrossed, BookOpen } from 'lucide-react';
import { Heading } from '@/components/ui/Typography';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import SectionCard from '../../../../components/SectionCard';
import { useI18n } from '../../../../i18n';
import PortionSelector from '../PortionSelector';
import type { PortionResult } from '../PortionSelector';
import ContextualScoreChip from '../ContextualScoreChip';
import type { ScannedProduct } from '../../utils/pseudo-ingredient';
import type { FoodVariant, FoodFamily } from '../../../../types/food-family';
import type { FamilyMatchResult } from '../../utils/food-family-resolver';
import type { UnitSystem } from '../../utils/units';
import type { Goal } from '../../utils/contextual-score';
import type { Ingredient } from '../../../../types';

interface BarcodeFoundPanelProps {
  product: ScannedProduct;
  pseudoIngredient: Ingredient;
  matchResult: FamilyMatchResult | null;
  portionResult: PortionResult | null;
  useSeedMacros: boolean;
  onToggleSeedMacros: () => void;
  scoreVariant: FoodVariant | null;
  activeGoal: Goal | null;
  savedBrandFamilyIds: Set<string>;
  onSaveBrand: (family: FoodFamily) => void;
  unitSystem: UnitSystem;
  onPortionChange: (r: PortionResult) => void;
  onProductFound: (product: ScannedProduct, portionResult?: PortionResult) => void;
  onAddToRecipe?: (product: ScannedProduct) => void;
  onSaveToDictionary?: (product: ScannedProduct) => void;
  onScanAnother: () => void;
}

/**
 * Post-scan result panel rendered inside the BottomSheet when a product is
 * found in Open Food Facts (state === 'found').
 *
 * Owns no state of its own — all values and callbacks flow from BarcodeScanner.
 * This keeps the camera lifecycle and scan state machine in the parent while
 * the result UI can be tested and evolved independently.
 */
export default function BarcodeFoundPanel({
  product,
  pseudoIngredient,
  matchResult,
  portionResult,
  useSeedMacros,
  onToggleSeedMacros,
  scoreVariant,
  activeGoal,
  savedBrandFamilyIds,
  onSaveBrand,
  unitSystem,
  onPortionChange,
  onProductFound,
  onAddToRecipe,
  onSaveToDictionary,
  onScanAnother,
}: BarcodeFoundPanelProps) {
  const { t, locale } = useI18n();

  return (
    <div className="space-y-4">
      {/* Product header card */}
      <div className="bg-surface-container-low border border-green-500/30 rounded-sm p-4">
        <div className="flex items-start gap-3">
          {product.image && (
            <img src={product.image} alt="" className="w-16 h-16 rounded-sm object-cover shrink-0" referrerPolicy="no-referrer" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" aria-hidden="true" />
              <Badge variant="outline" className="text-primary border-primary/30">
                {t.scanner.scanned}
              </Badge>
              {/* P16 [1.5.74] — data source badge: RIAL curated vs OFF manufacturer. */}
              {useSeedMacros ? (
                <Badge variant="outline" className="text-primary border-primary/30" aria-label={t.scanner.sourceVerifiedAria}>
                  ✨ {t.scanner.sourceVerified}
                </Badge>
              ) : (
                <Badge variant="outline" className="text-on-surface-variant border-outline-variant/40" aria-label={t.scanner.sourceManufacturerAria}>
                  {t.scanner.sourceManufacturer}
                </Badge>
              )}
            </div>
            {product.brand && <p className="text-micro text-on-surface-variant mt-0.5">{product.brand}</p>}
            <p className="text-micro text-on-surface-variant/60 mt-1">{t.scanner.per100g}</p>
          </div>
        </div>
      </div>

      {/* P15 [1.5.73] — contextual score chip */}
      {scoreVariant && activeGoal && (
        <div className="flex items-center justify-center gap-2">
          <span className="text-micro font-label uppercase tracking-widest text-on-surface-variant">
            {t.contextualScore.forGoal.replace('{{goal}}', t.contextualScore.goalLabels[activeGoal])}
          </span>
          <ContextualScoreChip variant={scoreVariant} goal={activeGoal} size="md" />
        </div>
      )}

      {/* P5 — family match banner */}
      {matchResult && matchResult.type !== 'no-match' && (
        <MatchBanner
          matchResult={matchResult}
          useSeedMacros={useSeedMacros}
          onToggleSeedMacros={onToggleSeedMacros}
          savedBrandFamilyIds={savedBrandFamilyIds}
          onSaveBrand={onSaveBrand}
          locale={locale}
          t={t}
        />
      )}

      {/* Portion selector */}
      <SectionCard padding="none" spacing="none" className="p-4 space-y-2">
        <Heading level="h4" variant="overline">{t.portionSelector.adjustPortion}</Heading>
        <PortionSelector
          ingredient={pseudoIngredient}
          onChange={onPortionChange}
          unitSystem={unitSystem}
        />
      </SectionCard>

      {/* CTAs */}
      <div className="space-y-2">
        <Button
          variant="brand"
          className="w-full"
          onClick={() => onProductFound(product, portionResult ?? undefined)}
        >
          <UtensilsCrossed className="w-4 h-4 mr-2" aria-hidden="true" />
          {t.portionSelector.addToMeal}
        </Button>

        {(onAddToRecipe || onSaveToDictionary) && (
          <div className="grid grid-cols-2 gap-2">
            {onAddToRecipe && (
              <Button variant="outline" size="sm" onClick={() => onAddToRecipe(product)}>
                <BookOpen className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" />
                {t.portionSelector.addToRecipe}
              </Button>
            )}
            {onSaveToDictionary && (
              <Button variant="outline" size="sm" onClick={() => onSaveToDictionary(product)}>
                <Save className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" />
                {t.scanner.save}
              </Button>
            )}
          </div>
        )}
      </div>

      <Button variant="ghost" className="w-full" onClick={onScanAnother}>
        <RotateCcw className="w-3.5 h-3.5 mr-2" aria-hidden="true" />
        {t.scanner.scanAnother}
      </Button>
    </div>
  );
}

// ─── MatchBanner — internal sub-component ────────────────────────────────────

interface MatchBannerProps {
  matchResult: FamilyMatchResult;
  useSeedMacros: boolean;
  onToggleSeedMacros: () => void;
  savedBrandFamilyIds: Set<string>;
  onSaveBrand: (family: FoodFamily) => void;
  locale: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: any;
}

function MatchBanner({
  matchResult, useSeedMacros, onToggleSeedMacros,
  savedBrandFamilyIds, onSaveBrand, locale, t,
}: MatchBannerProps) {
  if (matchResult.type === 'no-match') return null;

  if (matchResult.type === 'known-barcode') {
    const famName = locale === 'es' ? matchResult.family.name : matchResult.family.nameEn;
    const variantName = locale === 'es' ? matchResult.variant.name : matchResult.variant.nameEn;
    return (
      <div className="flex items-start gap-2 bg-primary/10 border border-primary/20 rounded-sm p-3">
        <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
        <div className="flex-1 min-w-0">
          <p className="text-body-sm text-on-surface">
            <span className="font-bold">{t.scanner.knownProductFound}</span>
          </p>
          <p className="text-micro text-on-surface-variant mt-0.5">
            {variantName} · {famName}
          </p>
        </div>
      </div>
    );
  }

  if (matchResult.type === 'seed-match') {
    const famName = locale === 'es' ? matchResult.family.name : matchResult.family.nameEn;
    const seedName = locale === 'es' ? matchResult.variant.name : matchResult.variant.nameEn;
    const saved = savedBrandFamilyIds.has(matchResult.family.id);
    const seedIsCurated = matchResult.variant.source === 'seed';
    const hideSaveButton = useSeedMacros && seedIsCurated;
    return (
      <div className="space-y-2">
        <SectionCard padding="none" spacing="none" className="flex items-start gap-2 p-3">
          <Info className="w-4 h-4 text-on-surface-variant shrink-0 mt-0.5" aria-hidden="true" />
          <div className="flex-1 min-w-0">
            <p className="text-body-sm text-on-surface-variant">
              {t.scanner.foundInFamily}{' '}
              <span className="font-bold text-on-surface">{famName}</span>
            </p>
            <p className="text-micro text-on-surface-variant/80 mt-0.5">
              {t.scanner.similarBrand}: <span className="font-bold text-on-surface">{seedName}</span>
            </p>
          </div>
        </SectionCard>
        {/* P16 [1.5.74] — swap macros source toggle */}
        <Button
          variant={useSeedMacros ? 'brand' : 'outline'}
          size="sm"
          className="w-full"
          onClick={onToggleSeedMacros}
          aria-pressed={useSeedMacros}
        >
          {useSeedMacros ? (
            <><CheckCircle2 className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" />{t.scanner.usingVerifiedData}</>
          ) : (
            <><Info className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" />{t.scanner.useVerifiedData.replace('{{name}}', seedName)}</>
          )}
        </Button>
        {!hideSaveButton && (
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => onSaveBrand(matchResult.family)}
            disabled={saved}
            aria-label={saved ? t.scanner.savedToBrands : t.scanner.saveAsBrandVariant}
          >
            {saved ? (
              <><CheckCircle2 className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" />{t.scanner.savedToBrands}</>
            ) : (
              <><Save className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" />{t.scanner.saveAsBrandVariant}</>
            )}
          </Button>
        )}
      </div>
    );
  }

  if (matchResult.type === 'fuzzy') {
    const famName = locale === 'es' ? matchResult.family.name : matchResult.family.nameEn;
    const saved = savedBrandFamilyIds.has(matchResult.family.id);
    return (
      <div className="space-y-2">
        <p className="text-body-sm text-on-surface-variant text-center">
          {t.scanner.confirmFamily}{' '}
          <span className="font-bold text-on-surface">{famName}</span>?
        </p>
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => onSaveBrand(matchResult.family)}
          disabled={saved}
          aria-label={saved ? t.scanner.savedToBrands : t.scanner.saveAsBrandVariant}
        >
          {saved ? (
            <><CheckCircle2 className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" />{t.scanner.savedToBrands}</>
          ) : (
            <><Save className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" />{t.scanner.saveAsBrandVariant}</>
          )}
        </Button>
      </div>
    );
  }

  if (matchResult.type === 'ambiguous') {
    return (
      <div className="space-y-2">
        <p className="text-micro font-label uppercase tracking-widest text-on-surface-variant text-center">
          {t.scanner.chooseFamily}
        </p>
        <div className="flex flex-wrap gap-2 justify-center">
          {matchResult.candidates.map(({ family }) => {
            const famName = locale === 'es' ? family.name : family.nameEn;
            const saved = savedBrandFamilyIds.has(family.id);
            return (
              <button
                key={family.id}
                type="button"
                onClick={() => onSaveBrand(family)}
                disabled={saved}
                className={`px-3 py-1.5 rounded-sm text-body-sm border min-h-11 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                  saved
                    ? 'bg-primary/10 border-primary/30 text-primary'
                    : 'bg-surface-container-highest border-outline-variant/20 text-on-surface'
                }`}
              >
                {saved ? `✓ ${famName}` : famName}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return null;
}

// Re-export ScannedProduct so call-sites that imported it from BarcodeFoundPanel don't break.
export type { ScannedProduct };
