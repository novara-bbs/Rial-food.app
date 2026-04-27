/**
 * CreateRecipe wizard — Step 4: Review.
 *
 * Read-only summary of all form data. Creator-publish checkbox (verified-only).
 * Pure presentation — no local state except the publishAsVerified toggle
 * which is lifted to the orchestrator.
 */
import { Camera, Clock, Link2, ThumbsUp, AlertTriangle, Minus, Check, BadgeCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Heading } from '@/components/ui/Typography';
import { useI18n } from '../../../../i18n';
import MacroTile from '../../../../components/patterns/MacroTile';
import VideoSection from '../VideoSection';
import { detectTimers } from '../../utils/create-recipe-helpers';
import type { Ingredient, RecipeIngredient, RecipeStep, FoodTag } from '../../../../types';
import type { Difficulty } from '../../../../types/taxonomy';
import type { SourceType } from './BasicInfoSection';

export interface ReviewSectionProps {
  title: string;
  description: string;
  prepTime: number;
  cookTime: number;
  difficulty: Difficulty;
  servings: number;
  perServing: { calories: number; protein: number; carbs: number; fats: number };
  quality: 'good' | 'neutral' | 'poor';
  autoTags: FoodTag[];
  recipeIngredients: RecipeIngredient[];
  steps: RecipeStep[];
  videoUrl: string;
  sourceUrl: string;
  detectedSourceType: SourceType;
  dictionary: Ingredient[];
  publishAsVerified: boolean;
  onPublishAsVerifiedChange: (v: boolean) => void;
  isVerifiedCreator: boolean;
}

export default function ReviewSection({
  title, description,
  prepTime, cookTime, difficulty, servings,
  perServing, quality, autoTags,
  recipeIngredients, steps,
  videoUrl, sourceUrl, detectedSourceType,
  dictionary,
  publishAsVerified, onPublishAsVerifiedChange, isVerifiedCreator,
}: ReviewSectionProps) {
  const { t } = useI18n();

  const resolvedName = (ri: RecipeIngredient): string =>
    (ri.ingredient ?? dictionary.find(i => i.id === ri.ingredientId))?.name
    ?? ri.ingredientId ?? '—';

  const cleanSteps = steps.filter(s => s.text.trim());

  return (
    <div className="space-y-5">
      {/* Recipe preview card */}
      <div className="bg-surface-container-low rounded-sm border border-outline-variant/20 overflow-hidden">
        <div className="h-32 bg-gradient-to-br from-primary/20 to-brand-secondary/20 flex items-center justify-center">
          <Camera className="w-10 h-10 text-on-surface-variant/40" />
        </div>
        <div className="p-4 space-y-2">
          <Heading level="h3">{title || '—'}</Heading>
          {description && (
            <p className="text-sm text-on-surface-variant line-clamp-2">{description}</p>
          )}
          <div className="flex items-center gap-3 text-micro font-label uppercase tracking-widest text-on-surface-variant flex-wrap">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {prepTime ? `${prepTime} min` : '—'} + {cookTime ? `${cookTime} min` : '—'}
            </span>
            <span>{t.recipes[difficulty]}</span>
            <span>{servings} {t.recipes.servings}</span>
            <Badge
              variant="outline"
              className={`gap-0.5 ${
                quality === 'good' ? 'text-primary border-primary/30' :
                quality === 'poor' ? 'text-error border-error/30' :
                'text-brand-secondary border-brand-secondary/30'
              }`}
            >
              {quality === 'good'
                ? <ThumbsUp className="w-2.5 h-2.5" />
                : quality === 'poor'
                ? <AlertTriangle className="w-2.5 h-2.5" />
                : <Minus className="w-2.5 h-2.5" />}
              {t.recipes.foodQuality[quality as keyof typeof t.recipes.foodQuality]}
            </Badge>
          </div>
        </div>
      </div>

      {/* Video preview — reuses <VideoSection> so creator preview = production render */}
      {videoUrl && <VideoSection videoUrl={videoUrl} />}

      {/* Source link */}
      {sourceUrl && (
        <div className="flex items-center gap-2 bg-surface-container-low p-3 rounded-sm border border-outline-variant/20">
          <Link2 className="w-4 h-4 text-on-surface-variant shrink-0" />
          <span className="text-xs text-on-surface-variant truncate flex-1">{sourceUrl}</span>
          <Badge variant="outline" className="text-on-surface-variant border-outline-variant/30 shrink-0">
            {detectedSourceType}
          </Badge>
        </div>
      )}

      {/* Per-serving macros */}
      <div className="bg-surface-container-low p-4 rounded-sm border border-outline-variant/20">
        <Heading level="h4" variant="overline" className="text-on-surface-variant mb-3 text-micro">
          {t.createRecipe.perServing}
        </Heading>
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'kcal', value: perServing.calories, color: 'text-primary' },
            { label: 'Pro', value: `${perServing.protein}g`, color: 'text-macro-protein' },
            { label: 'Carbs', value: `${perServing.carbs}g`, color: 'text-macro-carbs' },
            { label: 'Fat', value: `${perServing.fats}g`, color: 'text-macro-fats' },
          ].map(m => (
            <MacroTile key={m.label} size="md" value={m.value} label={m.label} valueColorClassName={m.color} />
          ))}
        </div>
      </div>

      {/* Auto-suggested tags */}
      {autoTags.length > 0 && (
        <div className="space-y-2">
          <Heading level="h4" variant="overline" className="text-on-surface-variant text-micro">
            {t.createRecipe.suggestedTags}
          </Heading>
          <div className="flex flex-wrap gap-1.5">
            {autoTags.map(tag => (
              <Badge key={tag} variant="outline" className="text-primary border-primary/30">{tag}</Badge>
            ))}
          </div>
        </div>
      )}

      {/* Ingredients summary */}
      <div className="space-y-2">
        <Heading level="h4" variant="overline" className="text-on-surface-variant text-micro">
          {recipeIngredients.length} {t.recipes.ingredients}
        </Heading>
        {recipeIngredients.map(ri => (
          <div key={ri.id} className="flex items-center justify-between py-1.5 border-b border-outline-variant/10 last:border-0">
            <span className="font-body text-sm text-tertiary">{resolvedName(ri)}</span>
            <span className="font-label text-xs text-on-surface-variant">{ri.amount}g</span>
          </div>
        ))}
      </div>

      {/* Steps summary */}
      {cleanSteps.length > 0 && (
        <div className="space-y-2">
          <Heading level="h4" variant="overline" className="text-on-surface-variant text-micro">
            {cleanSteps.length} {t.recipes.steps}
          </Heading>
          {cleanSteps.map((s, idx) => {
            const timers = detectTimers(s.text);
            return (
              <div key={idx} className="flex gap-2 items-start">
                <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-micro font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  {s.photoUrl && (
                    <div className="w-full aspect-video rounded-sm overflow-hidden mb-1.5 bg-surface-container-highest">
                      <img src={s.photoUrl} alt={`Step ${idx + 1}`} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <p className="text-sm text-on-surface-variant line-clamp-2">{s.text}</p>
                  {timers.length > 0 && (
                    <div className="flex gap-1 mt-1">
                      {timers.map((m, i) => (
                        <Badge key={i} variant="outline" className="text-primary border-primary/30 gap-0.5 text-micro">
                          <Clock className="w-2 h-2" /> {m}min
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Verified-creator publish flag — visible only when profile flag is set */}
      {isVerifiedCreator && (
        <label className="flex items-start gap-3 bg-surface-container-low p-4 rounded-sm border border-primary/20 cursor-pointer select-none">
          <div className="mt-0.5 shrink-0">
            <input
              type="checkbox"
              checked={publishAsVerified}
              onChange={e => onPublishAsVerifiedChange(e.target.checked)}
              className="sr-only"
            />
            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${publishAsVerified ? 'bg-primary border-primary' : 'border-outline-variant bg-transparent'}`}>
              {publishAsVerified && <Check className="w-3 h-3 text-on-primary" />}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <span className="flex items-center gap-1.5 font-headline font-bold text-body-sm text-tertiary">
              <BadgeCheck className="w-4 h-4 text-primary" />
              {t.createRecipe.publishAsVerified}
            </span>
            <p className="text-xs text-on-surface-variant mt-0.5">{t.createRecipe.verifiedCreatorHint}</p>
          </div>
        </label>
      )}
    </div>
  );
}
