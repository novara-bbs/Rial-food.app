/**
 * CreateRecipe wizard — Step 1: Basic Info.
 *
 * Covers: hero photo gallery, title, description, prep/cook times,
 * difficulty, servings, meal slots (suitableFor), video URL, source URL.
 *
 * Pure presentation — all state is lifted to CreateRecipe orchestrator.
 */
import { Video, Link2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useI18n } from '../../../../i18n';
import type { Difficulty } from '../../../../types/taxonomy';
import type { MealSlot } from '../../../../types';
import PhotoUploader from '../PhotoUploader';
import MealSlotMultiSelect from '../../../food/components/MealSlotMultiSelect';

export type SourceType = 'original' | 'youtube' | 'tiktok' | 'instagram' | 'blog';

export interface BasicInfoSectionProps {
  title: string;
  onTitleChange: (v: string) => void;
  description: string;
  onDescriptionChange: (v: string) => void;
  prepTime: number;
  onPrepTimeChange: (v: number) => void;
  cookTime: number;
  onCookTimeChange: (v: number) => void;
  difficulty: Difficulty;
  onDifficultyChange: (v: Difficulty) => void;
  servings: number;
  onServingsChange: (v: number) => void;
  suitableFor: MealSlot[];
  onSuitableForChange: (v: MealSlot[]) => void;
  videoUrl: string;
  onVideoUrlChange: (v: string) => void;
  sourceUrl: string;
  onSourceUrlChange: (v: string) => void;
  detectedSourceType: SourceType;
  photos: string[];
  onPhotosChange: (v: string[]) => void;
}

export default function BasicInfoSection({
  title, onTitleChange,
  description, onDescriptionChange,
  prepTime, onPrepTimeChange,
  cookTime, onCookTimeChange,
  difficulty, onDifficultyChange,
  servings, onServingsChange,
  suitableFor, onSuitableForChange,
  videoUrl, onVideoUrlChange,
  sourceUrl, onSourceUrlChange,
  detectedSourceType,
  photos, onPhotosChange,
}: BasicInfoSectionProps) {
  const { t } = useI18n();

  return (
    <div className="space-y-5">
      <PhotoUploader photos={photos} onChange={onPhotosChange} max={6} />

      {/* Title */}
      <div>
        <label className="font-label text-caption font-bold tracking-widest uppercase text-on-surface-variant mb-2 block">
          {t.createRecipe.recipeName}
        </label>
        <input
          type="text"
          value={title}
          onChange={e => onTitleChange(e.target.value)}
          placeholder={t.createRecipe.namePlaceholder}
          className="w-full bg-surface-container-low border border-outline-variant/30 p-4 font-body text-sm text-tertiary rounded-sm focus:outline-none focus:border-primary transition-all placeholder:text-outline-variant"
        />
      </div>

      {/* Description */}
      <div>
        <label className="font-label text-caption font-bold tracking-widest uppercase text-on-surface-variant mb-2 block">
          {t.createRecipe.description}
        </label>
        <textarea
          value={description}
          onChange={e => onDescriptionChange(e.target.value)}
          placeholder={t.createRecipe.descPlaceholder}
          rows={3}
          className="w-full bg-surface-container-low border border-outline-variant/30 p-4 font-body text-sm text-tertiary rounded-sm focus:outline-none focus:border-primary transition-all placeholder:text-outline-variant resize-none"
        />
      </div>

      {/* Time + Difficulty + Servings grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Prep time */}
        <div>
          <label className="font-label text-caption font-bold tracking-widest uppercase text-on-surface-variant mb-2 block">
            {t.createRecipe.prepTime}
          </label>
          <div className="relative">
            <input
              type="number"
              inputMode="numeric"
              min={0}
              step={5}
              value={prepTime || ''}
              onChange={e => onPrepTimeChange(Math.max(0, parseInt(e.target.value, 10) || 0))}
              placeholder="15"
              className="w-full bg-surface-container-low border border-outline-variant/30 p-3 pr-12 font-body text-sm text-tertiary rounded-sm focus:outline-none focus:border-primary transition-all placeholder:text-outline-variant"
            />
            <span aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 font-label text-micro tracking-widest uppercase text-on-surface-variant">min</span>
          </div>
        </div>

        {/* Cook time */}
        <div>
          <label className="font-label text-caption font-bold tracking-widest uppercase text-on-surface-variant mb-2 block">
            {t.createRecipe.cookTime}
          </label>
          <div className="relative">
            <input
              type="number"
              inputMode="numeric"
              min={0}
              step={5}
              value={cookTime || ''}
              onChange={e => onCookTimeChange(Math.max(0, parseInt(e.target.value, 10) || 0))}
              placeholder="20"
              className="w-full bg-surface-container-low border border-outline-variant/30 p-3 pr-12 font-body text-sm text-tertiary rounded-sm focus:outline-none focus:border-primary transition-all placeholder:text-outline-variant"
            />
            <span aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 font-label text-micro tracking-widest uppercase text-on-surface-variant">min</span>
          </div>
        </div>

        {/* Difficulty */}
        <div>
          <label className="font-label text-caption font-bold tracking-widest uppercase text-on-surface-variant mb-2 block">
            {t.recipes.difficulty}
          </label>
          <select
            value={difficulty}
            onChange={e => onDifficultyChange(e.target.value as Difficulty)}
            className="w-full bg-surface-container-low border border-outline-variant/30 p-3 font-body text-sm text-tertiary rounded-sm focus:outline-none focus:border-primary transition-all"
          >
            <option value="easy">{t.recipes.easy}</option>
            <option value="medium">{t.recipes.medium}</option>
            <option value="hard">{t.recipes.hard}</option>
          </select>
        </div>

        {/* Servings */}
        <div>
          <label className="font-label text-caption font-bold tracking-widest uppercase text-on-surface-variant mb-2 block">
            {t.recipes.servings}
          </label>
          <input
            type="number"
            value={servings}
            onChange={e => onServingsChange(Math.max(1, parseInt(e.target.value) || 1))}
            min={1}
            className="w-full bg-surface-container-low border border-outline-variant/30 p-3 font-body text-sm text-tertiary rounded-sm focus:outline-none focus:border-primary transition-all"
          />
        </div>
      </div>

      {/* Meal slots (Q19 multi-valued taxonomy) */}
      <div>
        <label className="font-label text-caption font-bold tracking-widest uppercase text-on-surface-variant mb-2 block">
          {t.createRecipe.suitableForLabel}
        </label>
        <MealSlotMultiSelect
          value={suitableFor}
          onChange={onSuitableForChange}
          ariaLabel={t.createRecipe.suitableForLabel}
        />
        <p className="text-micro font-label tracking-widest uppercase text-on-surface-variant mt-2">
          {t.createRecipe.suitableForHelp}
        </p>
      </div>

      {/* Video + Source URLs */}
      <div className="space-y-3 pt-2">
        <div>
          <label className="font-label text-caption font-bold tracking-widest uppercase text-on-surface-variant mb-2 flex items-center gap-1.5">
            <Video className="w-3.5 h-3.5" />
            {t.createRecipe.videoLabel}
          </label>
          <input
            type="url"
            value={videoUrl}
            onChange={e => onVideoUrlChange(e.target.value)}
            placeholder="https://youtube.com/watch?v=..."
            className="w-full bg-surface-container-low border border-outline-variant/30 p-3 font-body text-sm text-tertiary rounded-sm focus:outline-none focus:border-primary transition-all placeholder:text-outline-variant"
          />
        </div>
        <div>
          <label className="font-label text-caption font-bold tracking-widest uppercase text-on-surface-variant mb-2 flex items-center gap-1.5">
            <Link2 className="w-3.5 h-3.5" />
            {t.createRecipe.sourceLabel}
          </label>
          <input
            type="url"
            value={sourceUrl}
            onChange={e => onSourceUrlChange(e.target.value)}
            placeholder="https://..."
            className="w-full bg-surface-container-low border border-outline-variant/30 p-3 font-body text-sm text-tertiary rounded-sm focus:outline-none focus:border-primary transition-all placeholder:text-outline-variant"
          />
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
