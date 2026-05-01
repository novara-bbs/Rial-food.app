/**
 * Step 4 — Recipe review: preview card, macros, auto-tags, ingredient summary,
 * step summary, verified-creator publish flag.
 *
 * Pure read-only display of state owned by the parent CreateRecipe.
 *
 * Extracted in Sprint 32 [1.5.146] from CreateRecipe.tsx.
 */
import { Camera, Clock, UtensilsCrossed, Link2, ThumbsUp, AlertTriangle, Minus, Check, BadgeCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Heading } from '@/components/ui/Typography';
import VideoSection from '../VideoSection';
import MacroTile from '../../../../components/patterns/MacroTile';
import { detectTimers } from '../../utils/create-recipe-utils';
import type { RecipeIngredient, RecipeStep, FoodTag, Ingredient } from '../../../../types';
import type { useI18n } from '../../../../i18n';

type T = ReturnType<typeof useI18n>['t'];

interface Props {
  title: string;
  description: string;
  prepTime: number;
  cookTime: number;
  difficulty: string;
  servings: number;
  videoUrl: string;
  sourceUrl: string;
  detectedSourceType: string;
  perServing: { calories: number; protein: number; carbs: number; fats: number };
  autoTags: FoodTag[];
  quality: 'good' | 'poor' | 'neutral';
  recipeIngredients: RecipeIngredient[];
  steps: RecipeStep[];
  dictionary: Ingredient[];
  publishAsVerified: boolean;
  setPublishAsVerified: (v: boolean) => void;
  /** Only `isVerifiedCreator` is used here. */
  userProfile: { isVerifiedCreator?: boolean };
  t: T;
}

export default function CreateRecipeStep4Review({
  title, description, prepTime, cookTime, difficulty, servings,
  videoUrl, sourceUrl, detectedSourceType,
  perServing, autoTags, quality,
  recipeIngredients, steps, dictionary,
  publishAsVerified, setPublishAsVerified,
  userProfile,
  t,
}: Props) {
  return (
    <div className="space-y-5">
      {/* Recipe preview card */}
      <div className="bg-surface-container-low rounded-sm border border-outline-variant/20 overflow-hidden">
        <div className="h-32 bg-gradient-to-br from-primary/20 to-brand-secondary/20 flex items-center justify-center">
          <Camera className="w-10 h-10 text-on-surface-variant/40" />
        </div>
        <div className="p-4 space-y-2">
          <Heading level="h3">{title || '—'}</Heading>
          {description && <p className="text-sm text-on-surface-variant line-clamp-2">{description}</p>}
          <div className="flex items-center gap-3 text-micro font-label uppercase tracking-widest text-on-surface-variant flex-wrap">
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {prepTime ? `${prepTime} min` : '—'} + {cookTime ? `${cookTime} min` : '—'}</span>
            <span className="flex items-center gap-1"><UtensilsCrossed className="w-3 h-3" /> {difficulty}</span>
            <span>{servings} {t.recipes.servings}</span>
            <Badge variant="outline" className={`gap-0.5 ${
              quality === 'good' ? 'text-primary border-primary/30' :
              quality === 'poor' ? 'text-error border-error/30' :
              'text-brand-secondary border-brand-secondary/30'
            }`}>
              {quality === 'good' ? <ThumbsUp className="w-2.5 h-2.5" /> :
               quality === 'poor' ? <AlertTriangle className="w-2.5 h-2.5" /> :
               <Minus className="w-2.5 h-2.5" />}
              {t.recipes.foodQuality[quality]}
            </Badge>
          </div>
        </div>
      </div>

      {/* Video preview */}
      {videoUrl && <VideoSection videoUrl={videoUrl} />}

      {/* Source link */}
      {sourceUrl && (
        <div className="flex items-center gap-2 bg-surface-container-low p-3 rounded-sm border border-outline-variant/20">
          <Link2 className="w-4 h-4 text-on-surface-variant shrink-0" />
          <span className="text-xs text-on-surface-variant truncate flex-1">{sourceUrl}</span>
          <Badge variant="outline" className="text-on-surface-variant border-outline-variant/30 shrink-0">{detectedSourceType}</Badge>
        </div>
      )}

      {/* Per-serving macros */}
      <div className="bg-surface-container-low p-4 rounded-sm border border-outline-variant/20">
        <Heading level="h4" variant="overline" className="text-on-surface-variant mb-3 text-micro">{t.createRecipe.perServing}</Heading>
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

      {/* Auto tags */}
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

      {/* Ingredient summary */}
      <div className="space-y-2">
        <Heading level="h4" variant="overline" className="text-on-surface-variant text-micro">
          {recipeIngredients.length} {t.recipes.ingredients}
        </Heading>
        {recipeIngredients.map(ri => {
          const ing = ri.ingredient ?? dictionary.find(i => i.id === ri.ingredientId);
          const name = ing?.name ?? ri.ingredientId ?? '—';
          return (
            <div key={ri.id} className="flex items-center justify-between py-1.5 border-b border-outline-variant/10 last:border-0">
              <span className="font-body text-sm text-tertiary">{name}</span>
              <span className="font-label text-xs text-on-surface-variant">{ri.amount}g</span>
            </div>
          );
        })}
      </div>

      {/* Steps summary */}
      {steps.some(s => s.text.trim()) && (
        <div className="space-y-2">
          <Heading level="h4" variant="overline" className="text-on-surface-variant text-micro">
            {steps.filter(s => s.text.trim()).length} {t.recipes.steps}
          </Heading>
          {steps.filter(s => s.text.trim()).map((s, idx) => {
            const timers = detectTimers(s.text);
            return (
              <div key={idx} className="flex gap-2 items-start">
                <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-micro font-bold flex items-center justify-center shrink-0 mt-0.5">{idx + 1}</span>
                <div className="flex-1 min-w-0">
                  {s.photoUrl && (
                    <div className="w-full aspect-video rounded-sm overflow-hidden mb-1.5 bg-surface-container-highest">
                      <img src={s.photoUrl} alt={t.createRecipe.stepPhotoAlt.replace('{n}', String(idx + 1))} className="w-full h-full object-cover" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
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

      {/* Verified-creator publish checkbox — visible only when profile flag is set */}
      {userProfile.isVerifiedCreator && (
        <label className="flex items-start gap-3 bg-surface-container-low p-4 rounded-sm border border-primary/20 cursor-pointer select-none">
          <div className="mt-0.5 shrink-0">
            <input
              type="checkbox"
              checked={publishAsVerified}
              onChange={e => setPublishAsVerified(e.target.checked)}
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
