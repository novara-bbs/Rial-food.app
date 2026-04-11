import { X, Activity, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useI18n } from '../../../i18n';
import { useAppState } from '../../../contexts/AppStateContext';
import { useNavigation } from '../../../contexts/NavigationContext';
import { cleanExpiredStories } from '../handlers/story-handlers';
import type { Story, StorySlide } from '../../../types/social';

const SLIDE_DURATION = 5000;

export default function StoryViewer({ onBack }: { onBack: () => void }) {
  const { t } = useI18n();
  const { communityStories, handleMarkStoryViewed } = useAppState();
  const { navigateTo } = useNavigation();

  const activeStories = useMemo(() => cleanExpiredStories(communityStories), [communityStories]);

  const [storyIndex, setStoryIndex] = useState(0);
  const [slideIndex, setSlideIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const currentStory = activeStories[storyIndex];
  const currentSlide = currentStory?.slides[slideIndex];

  // Mark as viewed on open
  useEffect(() => {
    if (currentStory && handleMarkStoryViewed) {
      handleMarkStoryViewed(currentStory.id);
    }
  }, [currentStory?.id]);

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
  }, [storyIndex, slideIndex]);

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

  if (!currentStory || !currentSlide) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
        <p className="text-white">{t.stories?.expired || 'No stories'}</p>
        <button type="button" onClick={onBack} className="absolute top-6 right-6 text-white" aria-label="Close stories"><X className="w-6 h-6" /></button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col" onClick={handleTap}>
      {/* Progress bars */}
      <div className="absolute top-0 left-0 right-0 z-20 flex gap-1 p-3">
        {currentStory.slides.map((_, i) => (
          <div key={i} className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all"
              style={{ width: i < slideIndex ? '100%' : i === slideIndex ? `${progress}%` : '0%' }}
            />
          </div>
        ))}
      </div>

      {/* Author info */}
      <div className="absolute top-8 left-4 z-20 flex items-center gap-3">
        <img src={currentStory.authorAvatar} alt={currentStory.authorName} className="w-8 h-8 rounded-full object-cover border border-white/50" referrerPolicy="no-referrer" />
        <span className="text-white font-headline font-bold text-sm uppercase tracking-wider">{currentStory.authorName}</span>
        <span className="text-white/50 font-label text-[10px] tracking-widest uppercase">
          {getRelativeTime(currentStory.createdAt)}
        </span>
      </div>

      {/* Close */}
      <button type="button" onClick={(e) => { e.stopPropagation(); onBack(); }} className="absolute top-8 right-4 z-20 text-white/80 hover:text-white" aria-label="Close stories">
        <X className="w-6 h-6" />
      </button>

      {/* Slide content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <SlideContent slide={currentSlide} />
      </div>

      {/* Navigation hints */}
      <div className="absolute bottom-6 left-0 right-0 text-center">
        <span className="text-white/40 font-label text-[9px] tracking-[0.3em] uppercase">
          {t.stories?.tapToAdvance || 'Tap to advance'}
        </span>
      </div>
    </div>
  );
}

function SlideContent({ slide }: { slide: StorySlide }) {
  switch (slide.type) {
    case 'text':
      return (
        <div
          className="w-full max-w-md rounded-sm p-8 flex items-center justify-center min-h-[300px]"
          style={{ backgroundColor: slide.backgroundColor || '#1a1a2e' }}
        >
          <p className="text-white text-2xl font-headline font-bold text-center leading-relaxed">{slide.content}</p>
        </div>
      );
    case 'performance':
      return (
        <div className="bg-surface-container-low/20 backdrop-blur rounded-sm p-8 grid grid-cols-2 gap-8 max-w-sm">
          <div className="flex flex-col items-center text-center">
            <Activity className="w-10 h-10 text-primary mb-3" />
            <span className="font-headline text-4xl font-black text-white">{slide.performance?.recovery}%</span>
            <span className="font-label text-xs tracking-widest text-primary uppercase mt-2">Recovery</span>
          </div>
          <div className="flex flex-col items-center text-center">
            <TrendingUp className="w-10 h-10 text-brand-secondary mb-3" />
            <span className="font-headline text-4xl font-black text-white">{slide.performance?.strain}</span>
            <span className="font-label text-xs tracking-widest text-brand-secondary uppercase mt-2">Strain</span>
          </div>
        </div>
      );
    case 'recipe':
      return (
        <div className="bg-surface-container-low/20 backdrop-blur rounded-sm overflow-hidden max-w-sm w-full">
          {slide.recipe?.img && (
            <img src={slide.recipe.img} alt={slide.recipe.title} className="w-full h-48 object-cover" referrerPolicy="no-referrer" />
          )}
          <div className="p-6">
            <h3 className="font-headline font-bold text-xl uppercase text-white">{slide.recipe?.title}</h3>
            <div className="flex gap-4 mt-3">
              <span className="font-label text-sm tracking-widest text-primary">{slide.recipe?.cal} kcal</span>
              <span className="font-label text-sm tracking-widest text-white/70">{slide.recipe?.pro}g P</span>
            </div>
          </div>
        </div>
      );
    case 'image':
      return slide.image ? (
        <img src={slide.image} alt="Story" className="max-w-full max-h-[70vh] object-contain rounded-sm" />
      ) : null;
    default:
      return null;
  }
}

function getRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'ahora';
  if (hours === 1) return '1h';
  return `${hours}h`;
}
