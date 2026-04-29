/**
 * Step 1 — Basic recipe info: photos, name, description, times, difficulty,
 * servings, meal slots, source URL, video URL.
 *
 * Purely presentational: all state is owned by the parent CreateRecipe and
 * passed down as controlled props + setters.
 *
 * Extracted in Sprint 32 [1.5.146] from CreateRecipe.tsx.
 */
import { Video, Link2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import PhotoUploader from '../PhotoUploader';
import VideoSection from '../VideoSection';
import MealSlotMultiSelect from '../../../food/components/MealSlotMultiSelect';
import type { MealSlot } from '../../../../types';
import type { useI18n } from '../../../../i18n';

type T = ReturnType<typeof useI18n>['t'];

interface Props {
  title: string; setTitle: (v: string) => void;
  description: string; setDescription: (v: string) => void;
  prepTime: number; setPrepTime: (v: number) => void;
  cookTime: number; setCookTime: (v: number) => void;
  difficulty: 'Fácil' | 'Medio' | 'Difícil'; setDifficulty: (v: 'Fácil' | 'Medio' | 'Difícil') => void;
  servings: number; setServings: (v: number) => void;
  suitableFor: MealSlot[]; setSuitableFor: (v: MealSlot[]) => void;
  sourceUrl: string; setSourceUrl: (v: string) => void;
  videoUrl: string; setVideoUrl: (v: string) => void;
  photos: string[]; setPhotos: (v: string[]) => void;
  detectedSourceType: 'original' | 'youtube' | 'tiktok' | 'instagram' | 'blog';
  t: T;
}

export default function CreateRecipeStep1Basics({
  title, setTitle,
  description, setDescription,
  prepTime, setPrepTime,
  cookTime, setCookTime,
  difficulty, setDifficulty,
  servings, setServings,
  suitableFor, setSuitableFor,
  sourceUrl, setSourceUrl,
  videoUrl, setVideoUrl,
  photos, setPhotos,
  detectedSourceType,
  t,
}: Props) {
  return (
    <div className="space-y-5">
      <PhotoUploader photos={photos} onChange={setPhotos} max={6} />

      <div>
        <label className="font-label text-caption font-bold tracking-widest uppercase text-on-surface-variant mb-2 block">{t.createRecipe.recipeName}</label>
        <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder={t.createRecipe.namePlaceholder}
          className="rial-input p-4" />
      </div>

      <div>
        <label className="font-label text-caption font-bold tracking-widest uppercase text-on-surface-variant mb-2 block">{t.createRecipe.description}</label>
        <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder={t.createRecipe.descPlaceholder} rows={3}
          className="rial-input p-4 resize-none" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="font-label text-caption font-bold tracking-widest uppercase text-on-surface-variant mb-2 block">{t.createRecipe.prepTime}</label>
          <div className="relative">
            <input type="number" inputMode="numeric" min={0} step={5}
              value={prepTime || ''} onChange={e => setPrepTime(Math.max(0, parseInt(e.target.value, 10) || 0))}
              placeholder="15"
              className="rial-input p-3 pr-12" />
            <span aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 font-label text-micro tracking-widest uppercase text-on-surface-variant">min</span>
          </div>
        </div>
        <div>
          <label className="font-label text-caption font-bold tracking-widest uppercase text-on-surface-variant mb-2 block">{t.createRecipe.cookTime}</label>
          <div className="relative">
            <input type="number" inputMode="numeric" min={0} step={5}
              value={cookTime || ''} onChange={e => setCookTime(Math.max(0, parseInt(e.target.value, 10) || 0))}
              placeholder="20"
              className="rial-input p-3 pr-12" />
            <span aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 font-label text-micro tracking-widest uppercase text-on-surface-variant">min</span>
          </div>
        </div>
        <div>
          <label className="font-label text-caption font-bold tracking-widest uppercase text-on-surface-variant mb-2 block">{t.recipes.difficulty}</label>
          <select value={difficulty} onChange={e => setDifficulty(e.target.value as typeof difficulty)}
            className="rial-input p-3">
            <option value="Fácil">{t.recipes.easy}</option>
            <option value="Medio">{t.recipes.medium}</option>
            <option value="Difícil">{t.recipes.hard}</option>
          </select>
        </div>
        <div>
          <label className="font-label text-caption font-bold tracking-widest uppercase text-on-surface-variant mb-2 block">{t.recipes.servings}</label>
          <input type="number" value={servings} onChange={e => setServings(Math.max(1, parseInt(e.target.value) || 1))} min={1}
            className="rial-input p-3" />
        </div>
      </div>

      {/* Suitable-for slots — empty means versatile (Q19 meal-taxonomy). */}
      <div>
        <label className="font-label text-caption font-bold tracking-widest uppercase text-on-surface-variant mb-2 block">
          {t.createRecipe.suitableForLabel}
        </label>
        <MealSlotMultiSelect value={suitableFor} onChange={setSuitableFor} ariaLabel={t.createRecipe.suitableForLabel} />
        <p className="text-micro font-label tracking-widest uppercase text-on-surface-variant mt-2">
          {t.createRecipe.suitableForHelp}
        </p>
      </div>

      {/* Source & Video — creator-quality fields */}
      <div className="space-y-3 pt-2">
        <div>
          <label className="font-label text-caption font-bold tracking-widest uppercase text-on-surface-variant mb-2 flex items-center gap-1.5">
            <Video className="w-3.5 h-3.5" />
            {t.createRecipe.videoLabel}
          </label>
          <input type="url" value={videoUrl} onChange={e => setVideoUrl(e.target.value)}
            placeholder="https://youtube.com/watch?v=..."
            className="rial-input p-3 placeholder:text-outline-variant" />
          {videoUrl && <VideoSection videoUrl={videoUrl} />}
        </div>
        <div>
          <label className="font-label text-caption font-bold tracking-widest uppercase text-on-surface-variant mb-2 flex items-center gap-1.5">
            <Link2 className="w-3.5 h-3.5" />
            {t.createRecipe.sourceLabel}
          </label>
          <input type="url" value={sourceUrl} onChange={e => setSourceUrl(e.target.value)}
            placeholder="https://..."
            className="rial-input p-3 placeholder:text-outline-variant" />
          {sourceUrl && (
            <Badge variant="outline" className="mt-2 text-on-surface-variant border-outline-variant/30">
              {detectedSourceType}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
