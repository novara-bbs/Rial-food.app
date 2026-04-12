import { useState } from 'react';
import PageShell from '../../../components/PageShell';
import { Link, CheckCircle2, AlertTriangle, Loader2, FileText, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useI18n } from '../../../i18n';
import PageHeader from '../../../components/patterns/PageHeader';
import { getGeminiClient } from '../../ai/lib/gemini';
import { GEMINI_API_KEY } from '../../../config/env';
import { enhanceIngredients, EnhancedIngredient, RecipeIntelligenceResult } from '../utils/recipe-intelligence';

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

export default function ImportRecipeURL({ onBack, onImport }: { onBack: () => void; onImport: (recipe: any) => void }) {
  const { t } = useI18n();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [extracted, setExtracted] = useState<any>(null);
  const [intelligence, setIntelligence] = useState<RecipeIntelligenceResult | null>(null);
  const [error, setError] = useState('');
  const [inputMode, setInputMode] = useState<'url' | 'text'>('url');
  const [showAlternatives, setShowAlternatives] = useState<number | null>(null);

  const handleImport = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setError('');

    try {
      let data: any;

      if (!GEMINI_API_KEY) {
        await new Promise(r => setTimeout(r, 1500));
        data = buildFallback(url);
      } else {
        const ai = await getGeminiClient();
        const response = await ai.models.generateContent({
          model: 'gemini-2.0-flash',
          contents: EXTRACTION_PROMPT + url,
          config: { temperature: 0.2 },
        });

        const text = response.text || '';
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('No JSON in response');
        data = JSON.parse(jsonMatch[0]);
      }

      // Run intelligence pipeline: fuzzy match + unit conversion + macro calculation
      const rawIngredients = (data.ingredients || []).map((ing: any) => ({
        name: ing.name,
        amount: ing.amount ?? 0,
        unit: ing.unit ?? 'g',
      }));
      const result = enhanceIngredients(rawIngredients);
      setIntelligence(result);

      const source = inputMode === 'url'
        ? (url.includes('youtube') ? 'YouTube' : url.includes('instagram') ? 'Instagram' : 'Web')
        : 'Texto';

      setExtracted({
        ...data,
        ingredients: result.ingredients,
        source,
        sourceUrl: inputMode === 'url' ? url : undefined,
        // Use dictionary-calculated macros when match rate is good, otherwise keep AI estimates
        macros: result.matchRate >= 0.5 ? result.totalMacros : data.macros,
        macroSource: result.matchRate >= 0.5 ? 'dictionary' : 'ai',
      });
    } catch (err) {
      console.error('Import error:', err);
      const fallback = buildFallback(url);
      const result = enhanceIngredients(fallback.ingredients);
      setIntelligence(result);
      setExtracted({ ...fallback, ingredients: result.ingredients, macros: result.totalMacros, macroSource: 'dictionary' });
    } finally {
      setLoading(false);
    }
  };

  const buildFallback = (input: string) => ({
    title: 'Receta importada',
    description: 'Receta extraída automáticamente.',
    source: input.includes('youtube') ? 'YouTube' : input.includes('instagram') ? 'Instagram' : 'Web',
    sourceUrl: input,
    prepTime: '15M',
    cookTime: '25M',
    servings: 4,
    difficulty: 'Medio',
    ingredients: [
      { name: 'Pechuga de pollo', amount: 400, unit: 'g', matched: true },
      { name: 'Arroz basmati', amount: 300, unit: 'g', matched: true },
      { name: 'Cebolla', amount: 1, unit: 'ud', matched: true },
      { name: 'Especias al gusto', amount: 2, unit: 'cda', matched: false },
    ],
    steps: [
      'Cortar el pollo y sazonar.',
      'Saltear la cebolla en aceite.',
      'Añadir el pollo y cocinar 15 min.',
      'Servir sobre arroz.',
    ],
    macros: { calories: 480, protein: 38, carbs: 52, fats: 10, saturatedFat: 2, transFat: 0, sugar: 3 },
    tags: [],
  });

  const handleSave = () => {
    if (!extracted) return;
    onImport({
      ...extracted,
      img: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=600&q=80',
      tag: 'IMPORTADA',
    });
  };

  return (
    <PageShell maxWidth="narrow" spacing="md">
      <PageHeader onBack={onBack} label="" title={t.importUrl.title} />

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
              <Link className="w-4 h-4" /> URL
            </button>
            <button type="button"
              onClick={() => setInputMode('text')}
              className={`flex-1 py-3 font-headline text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors ${
                inputMode === 'text' ? 'bg-primary text-on-primary' : 'bg-surface-container-low text-on-surface-variant hover:text-tertiary'
              }`}
            >
              <FileText className="w-4 h-4" /> Texto
            </button>
          </div>

          <div>
            <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant mb-2">
              {inputMode === 'url' ? t.importUrl.paste : 'Pega el texto de la receta'}
            </label>
            {inputMode === 'url' ? (
              <div className="relative">
                <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                <input
                  type="url"
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                  className="w-full pl-10 pr-4 py-4 bg-surface-container-low border border-outline-variant/20 rounded-sm text-on-surface placeholder:text-on-surface-variant text-sm font-body focus:outline-none focus:border-primary"
                />
              </div>
            ) : (
              <textarea
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder={t.importUrl.pasteText}
                rows={8}
                className="w-full p-4 bg-surface-container-low border border-outline-variant/20 rounded-sm text-on-surface placeholder:text-on-surface-variant text-sm font-body focus:outline-none focus:border-primary resize-none"
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
          <div className="bg-surface-container-low border border-outline-variant/20 rounded-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <input
                value={extracted.title}
                onChange={e => setExtracted({ ...extracted, title: e.target.value })}
                className="flex-1 font-headline text-lg font-bold uppercase text-tertiary bg-transparent border-b border-outline-variant/20 focus:outline-none focus:border-primary pb-1"
              />
              <span className="text-[9px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-2 py-1 rounded ml-3">{extracted.source}</span>
            </div>
            <div className="flex gap-4 text-xs text-on-surface-variant font-label">
              <span>{extracted.prepTime} prep</span>
              {extracted.cookTime && <span>{extracted.cookTime} cocción</span>}
              <span>{extracted.servings} {t.recipes.servings}</span>
              {extracted.difficulty && <span>{extracted.difficulty}</span>}
            </div>
          </div>

          {/* Ingredients with intelligence */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-headline text-sm font-bold uppercase tracking-widest text-tertiary">{t.recipes.ingredients}</h3>
              {intelligence && (
                <span className="text-[9px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-2 py-1 rounded">
                  {Math.round(intelligence.matchRate * 100)}% {t.importUrl.matched}
                </span>
              )}
            </div>
            <div className="space-y-2">
              {(extracted.ingredients || []).map((ing: EnhancedIngredient, i: number) => (
                <div key={i} className="bg-surface-container-low border border-outline-variant/20 rounded-sm overflow-hidden">
                  <div className="flex items-center gap-3 p-3">
                    {ing.confidence === 'high'
                      ? <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                      : ing.confidence === 'medium'
                        ? <HelpCircle className="w-5 h-5 text-brand-secondary shrink-0" />
                        : <AlertTriangle className="w-5 h-5 text-error shrink-0" />
                    }
                    <div className="flex-1 min-w-0">
                      <span className="text-sm text-on-surface block truncate">{ing.name}</span>
                      {ing.match && (
                        <span className="text-[9px] text-on-surface-variant uppercase tracking-wider">
                          → {ing.match.ingredient.name} ({Math.round(ing.match.score * 100)}%)
                        </span>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs text-on-surface-variant font-mono block">{ing.amount} {ing.unit}</span>
                      {ing.conversion.method !== 'unknown' && ing.conversion.method !== 'weight' && (
                        <span className="text-[9px] text-on-surface-variant/60">≈ {ing.conversion.grams}g</span>
                      )}
                    </div>
                    {ing.match && (
                      <button type="button"
                        onClick={() => setShowAlternatives(showAlternatives === i ? null : i)}
                        className="p-1 text-on-surface-variant hover:text-primary transition-colors shrink-0"
                      >
                        {showAlternatives === i ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                  {/* Expanded details */}
                  {showAlternatives === i && ing.calculatedMacros && (
                    <div className="px-3 pb-3 pt-1 border-t border-outline-variant/10">
                      <div className="flex gap-3 text-[9px] font-label uppercase tracking-widest text-on-surface-variant">
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

          {/* Macros */}
          <div className="bg-surface-container-low border border-outline-variant/20 rounded-sm p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-label uppercase tracking-widest text-on-surface-variant">{t.importUrl.estimatedMacros}</span>
              {extracted.macroSource === 'dictionary' && (
                <span className="text-[8px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-1.5 py-0.5 rounded flex items-center gap-1">
                  <CheckCircle2 className="w-2.5 h-2.5" /> RIAL DATA
                </span>
              )}
            </div>
            <div className="flex gap-4 mt-2">
              {[
                { val: extracted.macros?.calories, label: t.common.kcal },
                { val: `${extracted.macros?.protein}g`, label: 'P' },
                { val: `${extracted.macros?.carbs}g`, label: 'C' },
                { val: `${extracted.macros?.fats}g`, label: 'G' },
              ].map(({ val, label }) => (
                <div key={label} className="text-center flex-1">
                  <span className="font-mono text-xl font-bold text-tertiary">{val}</span>
                  <p className="text-[9px] text-on-surface-variant uppercase">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Steps */}
          {extracted.steps?.length > 0 && (
            <div>
              <h3 className="font-headline text-sm font-bold uppercase tracking-widest text-tertiary mb-3">{t.recipes.steps}</h3>
              <div className="space-y-2">
                {extracted.steps.map((step: string, i: number) => (
                  <div key={i} className="flex gap-3 p-3 bg-surface-container-low border border-outline-variant/20 rounded-sm">
                    <span className="font-mono text-xs text-primary font-bold shrink-0">{i + 1}.</span>
                    <p className="text-sm text-on-surface">{step}</p>
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
    </PageShell>
  );
}
