import { X, Activity, TrendingUp } from 'lucide-react';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useI18n } from '../../../i18n';
import { useAppState } from '../../../contexts/AppStateContext';
import { cleanExpiredStories } from '../handlers/story-handlers';
import type { StorySlide } from '../../../types/social';
import { Heading } from '@/components/ui/Typography';

const SLIDE_DURATION = 5000;

export default function StoryViewer({ onBack }: { onBack: () => void }) {
  const { t } = useI18n();
  const { communityStories, handleMarkStoryViewed, selectedStoryAuthorId, setSelectedStoryAuthorId } = useAppState();
  const activeStories = useMemo(() => cleanExpiredStories(communityStories), [communityStories]);

  // Initial story: if StoryRingsRow set `selectedStoryAuthorId`, open at that author;
  // otherwise fall back to index 0. One-shot: reset the context flag after consuming.
  const initialStoryIndex = useMemo(() => {
    if (!selectedStoryAuthorId) return 0;
    const idx = activeStories.findIndex(s => s.authorId === selectedStoryAuthorId);
    return idx >= 0 ? idx : 0;
  }, [activeStories, selectedStoryAuthorId]);

  const [storyIndex, setStoryIndex] = useState(initialStoryIndex);
  const [slideIndex, setSlideIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  // Consume the transient `selectedStoryAuthorId` once on mount so a back-nav
  // re-entry to StoryViewer starts cleanly. Intentionally empty deps.
  useEffect(() => {
    if (selectedStoryAuthorId) setSelectedStoryAuthorId(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentStory = activeStories[storyIndex];
  const currentSlide = currentStory?.slides[slideIndex];

  // Mark as viewed on open
  useEffect(() => {
    if (currentStory && handleMarkStoryViewed) {
      handleMarkStoryViewed(currentStory.id);
    }
  }, [currentStory, handleMarkStoryViewed]);

  const advanceSlide = useCallback(() => {
    if (!currentStory) return;
    if (slideIndex < currentStory.slides.length - 1) {
      setSlideIndex(prev => prev + 1);
    } else if (storyIndex < activeStories.length - 1) {
      setStoryIndex(prev => prev + 1);
      setSlideIndex(0);
    } else {
      onBack();
    }
  }, [storyIndex, slideIndex, currentStory, activeStories.length, onBack]);

  // Auto-advance timer
  useEffect(() => {
    if (!currentSlide) return;
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          advanceSlide();
          return 0;
        }
        return prev + (100 / (SLIDE_DURATION / 50));
      });
    }, 50);
    return () => clearInterval(interval);
  }, [storyIndex, slideIndex, advanceSlide, currentSlide]);

  const goBack = useCallback(() => {
    if (slideIndex > 0) {
      setSlideIndex(prev => prev - 1);
    } else if (storyIndex > 0) {
      setStoryIndex(prev => prev - 1);
      setSlideIndex(0);
    }
  }, [storyIndex, slideIndex]);

  const handleTap = (e: React.MouseEvent) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x < rect.width / 3) goBack();
    else advanceSlide();
  };

  const formatRelativeTime = (iso: string): string => {
    const diff = Date.now() - new Date(iso).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return t.stories.timeNow;
    if (hours === 1) return t.stories.timeHourAgo;
    return t.stories.timeHoursAgo.replace('{n}', String(hours));
  };

  if (!currentStory || !currentSlide) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
        <p className="text-on-overlay">{t.stories.expired}</p>
        <button type="button" onClick={onBack} className="absolute top-6 right-6 text-on-overlay" aria-label={t.stories.closeLabel}><X className="w-6 h-6" /></button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col" onClick={handleTap}>
      {/* Progress bars */}
      <div className="absolute top-0 left-0 right-0 z-20 flex gap-1 p-3">
        {currentStory.slides.map((_, i) => (
          <div key={i} className="flex-1 h-0.5 bg-on-overlay/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-on-overlay rounded-full transition-all"
              style={{ width: i < slideIndex ? '100%' : i === slideIndex ? `${progress}%` : '0%' }}
            />
          </div>
        ))}
      </div>

      {/* Author info */}
      <div className="absolute top-8 left-4 z-20 flex items-center gap-3">
        <img src={currentStory.authorAvatar} onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} alt={currentStory.authorName} className="w-8 h-8 rounded-full object-cover border border-on-overlay/50" referrerPolicy="no-referrer" />
        <span className="text-on-overlay font-headline font-bold text-body-sm uppercase tracking-wider">{currentStory.authorName}</span>
        <span className="text-on-overlay/50 font-label text-micro tracking-widest uppercase">
          {formatRelativeTime(currentStory.createdAt)}
        </span>
      </div>

      {/* Close */}
      <button type="button" onClick={(e) => { e.stopPropagation(); onBack(); }} className="absolute top-8 right-4 z-20 text-on-overlay/80 hover:text-on-overlay" aria-label={t.stories.closeLabel}>
        <X className="w-6 h-6" />
      </button>

      {/* Slide content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <SlideContent slide={currentSlide} recoveryLabel={t.stories.recovery} strainLabel={t.stories.strain} />
      </div>

      {/* Navigation hints */}
      <div className="absolute bottom-6 left-0 right-0 text-center">
        <span className="text-on-overlay/40 font-label text-micro tracking-[0.3em] uppercase">
          {t.stories.tapToAdvance}
        </span>
      </div>
    </div>
  );
}

function SlideContent({ slide, recoveryLabel, strainLabel }: { slide: StorySlide; recoveryLabel: string; strainLabel: string }) {
  switch (slide.type) {
    case 'text':
      return (
        <div
          className="w-full max-w-md rounded-sm p-8 flex items-center justify-center min-h-[300px]"
          style={{ backgroundColor: slide.backgroundColor || '#1a1a2e' }}
        >
          <p className="text-on-overlay text-title font-headline font-bold text-center leading-relaxed">{slide.content}</p>
        </div>
      );
    case 'performance':
      return (
        <div className="bg-surface-container-low/20 backdrop-blur rounded-sm p-8 grid grid-cols-2 gap-8 max-w-sm">
          <div className="flex flex-col items-center text-center">
            <Activity className="w-10 h-10 text-primary mb-3" />
            <span className="font-headline text-display font-black text-on-overlay">{slide.performance?.recovery}%</span>
            <span className="font-label text-xs tracking-widest text-primary uppercase mt-2">{recoveryLabel}</span>
          </div>
          <div className="flex flex-col items-center text-center">
            <TrendingUp className="w-10 h-10 text-brand-secondary mb-3" />
            <span className="font-headline text-display font-black text-on-overlay">{slide.performance?.strain}</span>
            <span className="font-label text-xs tracking-widest text-brand-secondary uppercase mt-2">{strainLabel}</span>
          </div>
        </div>
      );
    case 'recipe':
      return (
        <div className="bg-surface-container-low/20 backdrop-blur rounded-sm overflow-hidden max-w-sm w-full">
          {slide.recipe?.img && (
            <img src={slide.recipe.img} onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} alt={slide.recipe.title} className="w-full h-48 object-cover" referrerPolicy="no-referrer" />
          )}
          <div className="p-6">
            <Heading level="h3" className="text-title-sm text-on-overlay">{slide.recipe?.title}</Heading>
            <div className="flex gap-4 mt-3">
              <span className="font-label text-sm tracking-widest text-primary">{slide.recipe?.cal} kcal</span>
              <span className="font-label text-sm tracking-widest text-on-overlay/70">{slide.recipe?.pro}g P</span>
            </div>
          </div>
        </div>
      );
    case 'image':
      return slide.image ? (
        <img src={slide.image} onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} alt="Story" className="max-w-full max-h-[70vh] object-contain rounded-sm" />
      ) : null;
    default:
      return null;
  }
}
