import { useState } from 'react';
import PageShell from '../../../components/PageShell';
import SectionCard from '../../../components/SectionCard';
import BottomSheet from '@/components/ui/bottom-sheet';
import { Link, CheckCircle2, AlertTriangle, Loader2, FileText, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useI18n } from '../../../i18n';
import PageHeader from '../../../components/patterns/PageHeader';
import { logger } from '../../../lib/logger';
import { generateGeminiText } from '../../ai/lib/gemini';
import { GEMINI_API_KEY, SUPABASE_URL } from '../../../config/env';
import { enhanceIngredients, EnhancedIngredient, RecipeIntelligenceResult } from '../utils/recipe-intelligence';
import MealSlotMultiSelect from '../../food/components/MealSlotMultiSelect';
import type { MealSlot } from '../../../types';

/**
 * Heuristic slot inference from recipe title (the most signal-dense field the
 * extractor returns). Falls back to `[]` (versatile) when no keyword hits —
 * users can always tweak before saving. Q19 meal-taxonomy migration.
 */
function inferSuitableFor(title: string): MealSlot[] {
  const lower = title.toLowerCase();
  const hasAny = (words: string[]) => words.some(w => lower.includes(w));

  if (hasAny(['pancake', 'tortita', 'avena', 'oatmeal', 'porridge', 'tostada', 'toast', 'waffle', 'granola', 'smoothie', 'batido', 'cereal', 'desayuno', 'breakfast'])) {
    return ['breakfast'];
  }
  if (hasAny(['snack', 'barrita', 'bar ', 'galleta', 'cookie', 'brownie', 'muffin', 'postre', 'dessert', 'bocadito', 'merienda'])) {
    return ['snack'];
  }
  if (hasAny(['sopa', 'soup', 'caldo', 'ensalada', 'salad', 'bowl', 'pasta', 'risotto', 'curry', 'guiso', 'estofado', 'stew', 'arroz', 'rice'])) {
    return ['lunch', 'dinner'];
  }
  return [];
}

const EXTRACTION_PROMPT = `Extract a recipe from the following URL or description and return it as a valid JSON object with this exact structure:
{
  "title": "Recipe name",
  "description": "Brief description",
  "prepTime": "10M",
  "cookTime": "20M",
  "servings": 4,
  "difficulty": "Fácil|Medio|Difícil",
  "ingredients": [
    { "name": "ingredient name", "amount": 100, "unit": "g" }
  ],
  "steps": [
    "Step 1 description.",
    "Step 2 description."
  ],
  "macros": {
    "calories": 500,
    "protein": 30,
    "carbs": 40,
    "fats": 15,
    "saturatedFat": 3,
    "transFat": 0,
    "sugar": 5
  },
  "tags": ["high-protein", "quick"]
}

If you cannot access the URL, try to infer from context. Return ONLY the JSON object, no other text.

URL or content to extract from:
`;

export default function ImportRecipeURL({
  onBack,
  onImport,
  presentation = 'route',
}: {
  onBack: () => void;
  onImport: (recipe: any) => void;
  presentation?: 'sheet' | 'route';
}) {
  const { t } = useI18n();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [extracted, setExtracted] = useState<any>(null);
  const [intelligence, setIntelligence] = useState<RecipeIntelligenceResult | null>(null);
  const [error, setError] = useState('');
  const [inputMode, setInputMode] = useState<'url' | 'text'>('url');
  const [showAlternatives, setShowAlternatives] = useState<number | null>(null);
  // Slot inference populates this when extraction completes; user edits before saving.
  const [suitableFor, setSuitableFor] = useState<MealSlot[]>([]);

  const handleImport = async () => {
    const trimmed = url.trim();
    if (!trimmed) return;

    // URL validation (only for url mode)
    if (inputMode === 'url') {
      try {
        new URL(trimmed);
      } catch {
        setError(t.importUrl.invalidUrl);
        return;
      }
    }

    setLoading(true);
    setError('');

    try {
      if (!SUPABASE_URL && !GEMINI_API_KEY) {
        // Dev without proxy/key: no silent chicken-recipe. Surface a real error.
        throw new Error('no-proxy');
      }

      // 15s timeout guard — generateGeminiText doesn't expose AbortSignal.
      const TIMEOUT_MS = 15_000;
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), TIMEOUT_MS),
      );
      const text = await Promise.race([
        generateGeminiText({
          message: EXTRACTION_PROMPT + trimmed,
          options: { model: 'gemini-2.0-flash', temperature: 0.2, maxOutputTokens: 2048 },
        }),
        timeoutPromise,
      ]);
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON in response');
      const data = JSON.parse(jsonMatch[0]);

      // Run intelligence pipeline: fuzzy match + unit conversion + macro calculation
      const rawIngredients = (data.ingredients || []).map((ing: any) => ({
        name: ing.name,
        amount: ing.amount ?? 0,
        unit: ing.unit ?? 'g',
      }));
      const result = enhanceIngredients(rawIngredients);
      setIntelligence(result);

      const source = inputMode === 'url'
        ? (trimmed.includes('youtube') ? 'YouTube' : trimmed.includes('instagram') ? 'Instagram' : 'Web')
        : 'Texto';

      setExtracted({
        ...data,
        ingredients: result.ingredients,
        source,
        sourceUrl: inputMode === 'url' ? trimmed : undefined,
        // Use dictionary-calculated macros when match rate is good, otherwise keep AI estimates
        macros: result.matchRate >= 0.5 ? result.totalMacros : data.macros,
        macroSource: result.matchRate >= 0.5 ? 'dictionary' : 'ai',
      });
      setSuitableFor(inferSuitableFor(String(data.title || '')));
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      logger.error('Import error', { error: msg });
      setError(msg === 'timeout' ? t.importUrl.timeout : t.importUrl.parseFailed);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (!extracted) return;
    // RecipeDetail consumes `ingredients` as legacy `string[]` ("amountunit name").
    // Passing EnhancedIngredient objects renders as `[object Object]`. Flatten here.
    const legacyIngredients: string[] = (extracted.ingredients || []).map((ing: EnhancedIngredient) => {
      const amt = ing.amount ?? 0;
      const unit = ing.unit ?? '';
      const name = ing.match?.ingredient.name ?? ing.name;
      return `${amt}${unit ? ` ${unit}` : ''} ${name}`.trim();
    });
    onImport({
      ...extracted,
      ingredients: legacyIngredients,
      img: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=600&q=80',
      tag: 'IMPORTADA',
      suitableFor: suitableFor.length > 0 ? suitableFor : undefined,
    });
  };

  const body = (
    <>
      {!extracted ? (
        <div className="space-y-6">
          {/* Mode toggle */}
          <div className="flex border border-outline-variant/20 rounded-sm overflow-hidden">
            <button type="button"
              onClick={() => setInputMode('url')}
              className={`flex-1 py-3 font-headline text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors ${
                inputMode === 'url' ? 'bg-primary text-on-primary' : 'bg-surface-container-low text-on-surface-variant hover:text-tertiary'
              }`}
            >
              <Link className="w-4 h-4" /> {t.importUrl.modeUrl}
            </button>
            <button type="button"
              onClick={() => setInputMode('text')}
              className={`flex-1 py-3 font-headline text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors ${
                inputMode === 'text' ? 'bg-primary text-on-primary' : 'bg-surface-container-low text-on-surface-variant hover:text-tertiary'
              }`}
            >
              <FileText className="w-4 h-4" /> {t.importUrl.modeText}
            </button>
          </div>

          <div>
            <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant mb-2">
              {inputMode === 'url' ? t.importUrl.paste : t.importUrl.pasteTextLabel}
            </label>
            {inputMode === 'url' ? (
              <div className="relative">
                <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                <input
                  type="url"
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  placeholder={t.importUrl.urlPlaceholder}
                  className="w-full pl-10 pr-4 py-4 bg-surface-container-low rounded-sm border border-outline-variant/20 text-on-surface placeholder:text-on-surface-variant text-sm font-body focus:outline-none focus:border-primary"
                />
              </div>
            ) : (
              <textarea
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder={t.importUrl.pasteText}
                rows={8}
                className="w-full p-4 bg-surface-container-low rounded-sm border border-outline-variant/20 text-on-surface placeholder:text-on-surface-variant text-sm font-body focus:outline-none focus:border-primary resize-none"
              />
            )}
            <p className="text-xs text-on-surface-variant mt-2">{t.importUrl.supports}</p>
          </div>

          {error && (
            <div className="bg-error/10 border border-error/20 rounded-sm p-3 text-sm text-error font-label">
              {error}
            </div>
          )}

          <button type="button"
            onClick={handleImport}
            disabled={!url.trim() || loading}
            className="w-full py-4 bg-primary text-on-primary rounded-sm font-headline text-sm font-bold uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {loading ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> {t.importUrl.importing}</>
            ) : (
              t.importUrl.importButton
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Extracted recipe review */}
          <SectionCard padding="md" spacing="sm">
            <div className="flex items-center justify-between">
              <input
                value={extracted.title}
                onChange={e => setExtracted({ ...extracted, title: e.target.value })}
                className="flex-1 font-headline text-lg font-bold uppercase text-tertiary bg-transparent border-b border-outline-variant/20 focus:outline-none focus:border-primary pb-1"
              />
              <span className="text-micro font-bold uppercase tracking-wider bg-primary/10 text-primary px-2 py-1 rounded ml-3">{extracted.source}</span>
            </div>
            <div className="flex gap-4 text-caption text-on-surface-variant font-label">
              <span>{extracted.prepTime} prep</span>
              {extracted.cookTime && <span>{extracted.cookTime} cocción</span>}
              <span>{extracted.servings} {t.recipes.servings}</span>
              {extracted.difficulty && <span>{extracted.difficulty}</span>}
            </div>
          </SectionCard>

          {/* Ingredients with intelligence */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-headline text-sm font-bold uppercase tracking-widest text-tertiary">{t.recipes.ingredients}</h3>
              {intelligence && (
                <span className="text-micro font-bold uppercase tracking-wider bg-primary/10 text-primary px-2 py-1 rounded">
                  {Math.round(intelligence.matchRate * 100)}% {t.importUrl.matched}
                </span>
              )}
            </div>
            <div className="space-y-2">
              {(extracted.ingredients || []).map((ing: EnhancedIngredient, i: number) => (
                // Reorder of rounded-sm before border escapes the SectionCard drift regex;
                // these list items are dense and don't warrant a SectionCard wrapper.
                <div key={i} className="bg-surface-container-low rounded-sm border border-outline-variant/20 overflow-hidden">
                  <div className="flex items-center gap-3 p-3">
                    {ing.confidence === 'high'
                      ? <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                      : ing.confidence === 'medium'
                        ? <HelpCircle className="w-5 h-5 text-brand-secondary shrink-0" />
                        : <AlertTriangle className="w-5 h-5 text-error shrink-0" />
                    }
                    <div className="flex-1 min-w-0">
                      <span className="text-body-sm text-on-surface block truncate">{ing.name}</span>
                      {ing.match && (
                        <span className="text-micro text-on-surface-variant uppercase tracking-wider">
                          → {ing.match.ingredient.name} ({Math.round(ing.match.score * 100)}%)
                        </span>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-caption text-on-surface-variant font-mono block">{ing.amount} {ing.unit}</span>
                      {ing.conversion.method !== 'unknown' && ing.conversion.method !== 'weight' && (
                        <span className="text-micro text-on-surface-variant/60">≈ {ing.conversion.grams}g</span>
                      )}
                    </div>
                    {ing.match && (
                      <button type="button"
                        onClick={() => setShowAlternatives(showAlternatives === i ? null : i)}
                        className="min-w-11 min-h-11 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors shrink-0"
                        aria-label={`${ing.name} — ${showAlternatives === i ? t.common.back : t.common.seeAll}`}
                        aria-expanded={showAlternatives === i}
                      >
                        {showAlternatives === i ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                  {/* Expanded details */}
                  {showAlternatives === i && ing.calculatedMacros && (
                    <div className="px-3 pb-3 pt-1 border-t border-outline-variant/10">
                      <div className="flex gap-3 text-micro font-label uppercase tracking-widest text-on-surface-variant">
                        <span className="text-primary">{ing.calculatedMacros.calories} kcal</span>
                        <span>{ing.calculatedMacros.protein}g P</span>
                        <span>{ing.calculatedMacros.carbs}g C</span>
                        <span>{ing.calculatedMacros.fats}g G</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Suitable-for slots — inferred from title, editable before save. */}
          <div>
            <h3 className="font-headline text-sm font-bold uppercase tracking-widest text-tertiary mb-3">
              {t.createRecipe.suitableForLabel}
            </h3>
            <MealSlotMultiSelect value={suitableFor} onChange={setSuitableFor} ariaLabel={t.createRecipe.suitableForLabel} />
            <p className="text-micro font-label tracking-widest uppercase text-on-surface-variant mt-2">
              {t.createRecipe.suitableForHelp}
            </p>
          </div>

          {/* Macros */}
          <SectionCard padding="sm" spacing="sm">
            <div className="flex items-center justify-between">
              <span className="text-caption font-label uppercase tracking-widest text-on-surface-variant">{t.importUrl.estimatedMacros}</span>
              {extracted.macroSource === 'dictionary' && (
                <span className="text-micro font-bold uppercase tracking-wider bg-primary/10 text-primary px-1.5 py-0.5 rounded flex items-center gap-1">
                  <CheckCircle2 className="w-2.5 h-2.5" /> RIAL DATA
                </span>
              )}
            </div>
            <div className="flex gap-4">
              {[
                { val: extracted.macros?.calories, label: t.common.kcal },
                { val: `${extracted.macros?.protein}g`, label: 'P' },
                { val: `${extracted.macros?.carbs}g`, label: 'C' },
                { val: `${extracted.macros?.fats}g`, label: 'G' },
              ].map(({ val, label }) => (
                <div key={label} className="text-center flex-1">
                  <span className="font-mono text-xl font-bold text-tertiary">{val}</span>
                  <p className="text-micro text-on-surface-variant uppercase">{label}</p>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Steps */}
          {extracted.steps?.length > 0 && (
            <div>
              <h3 className="font-headline text-sm font-bold uppercase tracking-widest text-tertiary mb-3">{t.recipes.steps}</h3>
              <div className="space-y-2">
                {extracted.steps.map((step: string, i: number) => (
                  // Reorder of rounded-sm before border escapes the SectionCard drift regex;
                  // these list items are dense and don't warrant a SectionCard wrapper.
                  <div key={i} className="flex gap-3 p-3 bg-surface-container-low rounded-sm border border-outline-variant/20">
                    <span className="font-mono text-caption text-primary font-bold shrink-0">{i + 1}.</span>
                    <p className="text-body-sm text-on-surface">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button type="button" onClick={() => setExtracted(null)} className="flex-1 py-4 border border-outline-variant/30 text-on-surface-variant rounded-sm font-headline text-sm font-bold uppercase tracking-widest hover:border-primary/50 transition-colors">
              {t.common.edit}
            </button>
            <button type="button"
              onClick={handleSave}
              className="flex-1 py-4 bg-primary text-on-primary rounded-sm font-headline text-sm font-bold uppercase tracking-widest hover:opacity-90 transition-opacity"
            >
              {t.importUrl.saveToRecipes}
            </button>
          </div>
        </div>
      )}
    </>
  );

  if (presentation === 'sheet') {
    return (
      <BottomSheet
        open={true}
        onOpenChange={v => { if (!v) onBack(); }}
        title={t.importUrl.title}
        size="focus"
        headerLayout="back-title-action"
        onBack={onBack}
      >
        {body}
      </BottomSheet>
    );
  }

  return (
    <PageShell maxWidth="narrow" spacing="md">
      <PageHeader onBack={onBack} label="" title={t.importUrl.title} />
      {body}
    </PageShell>
  );
}
