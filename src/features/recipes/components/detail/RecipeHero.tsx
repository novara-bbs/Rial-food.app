/**
 * RecipeDetail hero — media zone (carousel) + back/share/save chrome,
 * with the title block stacked below the media (NYT Cooking-style).
 *
 * Sprint 46 [1.5.160]: gradient overlay removed, video pulled into the
 * carousel as a peer slide, and the title moved below the image so the
 * media stays visually clean.
 *
 * The hero uses a bespoke <h2> with two-mode typography (verified recipes
 * get a Fraunces serif inline override per ADR-011 § verified-mode). The
 * <Heading> primitive doesn't support responsive sizing or per-instance
 * font swaps, so this stays raw.
 */
import { ArrowLeft, Share2, Bookmark, Clock } from 'lucide-react';
import { useI18n } from '@/i18n';
import HeroGallery, { type HeroMediaItem } from '../HeroGallery';
import { Button } from '@/components/ui/button';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RecipeData = any;

interface RecipeHeroProps {
  data: RecipeData;
  /** Verified recipes get a taller bleed hero (65vh) and Fraunces serif title. */
  isVerified: boolean;
  /** Unified media list (photos + optional video). */
  mediaItems: HeroMediaItem[];
  onBack: () => void;
  /** Tap on a photo opens lightbox at the matching photo index. */
  setLightboxIdx: (idx: number) => void;
  /** Open share-to-feed sheet. */
  onSharePress: () => void;
  /** Triggered when the bookmark button is tapped — parent decides save vs unsave-confirm. */
  onBookmarkPress: () => void;
  isSaved?: boolean;
  /** Whether the save action is wired (no-op when undefined). */
  onSaveRecipe?: unknown;
}

export default function RecipeHero({
  data,
  isVerified,
  mediaItems,
  onBack,
  setLightboxIdx,
  onSharePress,
  onBookmarkPress,
  isSaved,
  onSaveRecipe,
}: RecipeHeroProps) {
  const { t } = useI18n();

  const heroHeight = isVerified ? 'h-[65vh] max-h-[520px]' : 'h-56 md:h-72';

  return (
    <div>
      <div className={`relative w-full overflow-hidden ${heroHeight}`}>
        <HeroGallery
          items={mediaItems}
          alt={data.title}
          onPhotoTap={mediaItems.length > 0 ? (idx) => setLightboxIdx(idx) : undefined}
          className="absolute inset-0"
        />

        <Button
          variant="ghost"
          onClick={onBack}
          aria-label={t.common.back}
          className="absolute top-4 left-4 w-10 h-10 bg-surface/80 backdrop-blur-md rounded-full text-tertiary hover:bg-primary hover:text-on-primary transition-colors z-10"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>

        <div className="absolute top-4 right-4 flex gap-2 z-10">
          <Button
            variant="ghost"
            onClick={onSharePress}
            aria-label={t.recipeDetail.shareToFeed}
            className="w-10 h-10 bg-surface/80 backdrop-blur-md rounded-full text-tertiary hover:bg-primary hover:text-on-primary transition-colors"
          >
            <Share2 className="w-5 h-5" />
          </Button>
          {Boolean(onSaveRecipe) && (
            <Button
              variant="ghost"
              onClick={onBookmarkPress}
              aria-label={t.common.save}
              aria-pressed={!!isSaved}
              className="w-10 h-10 bg-surface/80 backdrop-blur-md rounded-full text-tertiary hover:bg-primary hover:text-on-primary transition-colors"
            >
              <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-primary text-primary' : ''}`} />
            </Button>
          )}
        </div>
      </div>

      {/* Title block — moved below the media (Sprint 46). NYT Cooking-style. */}
      <div className="px-6 pt-3 max-w-4xl mx-auto">
        {data.tag && (
          <span className="badge-card bg-surface-container-low text-primary uppercase tracking-wide mb-2 inline-flex">
            {data.tag}
          </span>
        )}
        {/*
          Bespoke recipe title: dual-mode typography that swaps to Fraunces serif
          via inline style for verified recipes (ADR-011 § verified-mode override)
          and scales responsively (text-2xl md:text-3xl). The <Heading> primitive
          doesn't expose responsive sizing or per-instance font swaps, so this
          stays raw with the lint rule disabled inline.
        */}
        {/* eslint-disable no-restricted-syntax -- bespoke recipe hero with verified Fraunces serif inline override + responsive size; cannot use <Heading> primitive */}
        <h2
          className="font-headline text-2xl md:text-3xl font-bold tracking-tighter leading-tight text-tertiary normal-case"
          style={isVerified ? { fontFamily: 'var(--font-serif)', textTransform: 'none' } : undefined}
        >
          {data.title}
        </h2>
        {/* eslint-enable no-restricted-syntax */}
        {/* Classic time row — hidden for verified (replaced by TimeTileComposite below) */}
        {!isVerified && (
          <div className="flex items-center gap-3 mt-1.5 text-on-surface-variant text-label font-label uppercase tracking-widest">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> {data.prepTime} + {data.cookTime}
            </span>
            <span>•</span>
            <span>{data.difficulty}</span>
          </div>
        )}
      </div>
    </div>
  );
}
