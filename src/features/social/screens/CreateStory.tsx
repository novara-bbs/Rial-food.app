import { Type, Activity, ChefHat, Send } from 'lucide-react';
import PageShell from '../../../components/PageShell';
import { useState } from 'react';
import { useI18n } from '../../../i18n';
import { useAppState } from '../../../contexts/AppStateContext';
import ImagePicker from '../components/ImagePicker';
import PageHeader from '../../../components/patterns/PageHeader';
import RecipePicker from '../components/RecipePicker';
import type { StorySlide } from '../../../types/social';

const COLORS = ['#1a1a2e', '#0d3b66', '#2d6a4f', '#6b2737', '#4a1942', '#1b1b2f'];

type StoryType = 'text' | 'performance' | 'recipe' | 'image';

export default function CreateStory({ onBack }: { onBack: () => void }) {
  const { t } = useI18n();
  const { savedRecipes, handlePublishStory } = useAppState();
  const [storyType, setStoryType] = useState<StoryType>('text');
  const [textContent, setTextContent] = useState('');
  const [bgColor, setBgColor] = useState(COLORS[0]);
  const [image, setImage] = useState<string | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null);
  const [showRecipePicker, setShowRecipePicker] = useState(false);

  const userPerformance = { recovery: 82, strain: 14.5 };

  const canPublish = () => {
    switch (storyType) {
      case 'text': return textContent.trim().length > 0;
      case 'performance': return true;
      case 'recipe': return !!selectedRecipe;
      case 'image': return !!image;
    }
  };

  const handlePublish = () => {
    let slide: StorySlide;
    switch (storyType) {
      case 'text':
        slide = { id: `slide-${Date.now()}`, type: 'text', content: textContent, backgroundColor: bgColor };
        break;
      case 'performance':
        slide = { id: `slide-${Date.now()}`, type: 'performance', performance: userPerformance };
        break;
      case 'recipe':
        slide = { id: `slide-${Date.now()}`, type: 'recipe', recipe: selectedRecipe };
        break;
      case 'image':
        slide = { id: `slide-${Date.now()}`, type: 'image', image: image! };
        break;
    }
    handlePublishStory([slide]);
  };

  const types: { key: StoryType; icon: React.ReactNode; label: string }[] = [
    { key: 'text', icon: <Type className="w-4 h-4" />, label: t.stories?.text || 'Text' },
    { key: 'performance', icon: <Activity className="w-4 h-4" />, label: t.stories?.performance || 'Performance' },
    { key: 'recipe', icon: <ChefHat className="w-4 h-4" />, label: t.stories?.recipe || 'Recipe' },
  ];

  return (
    <PageShell maxWidth="narrow" spacing="md">
      <PageHeader
        onBack={onBack}
        title={t.stories?.create || 'Create Story'}
        rightAction={
          <button type="button"
            onClick={handlePublish}
            disabled={!canPublish()}
            className="bg-primary text-on-primary px-4 py-2 rounded-sm font-label text-xs font-bold tracking-widest uppercase flex items-center gap-2 hover:bg-primary-container transition-colors disabled:opacity-50"
          >
            <Send className="w-4 h-4" /> {t.stories?.publish || 'Publish'}
          </button>
        }
      />

      {/* Type selector */}
      <div className="flex gap-2">
        {types.map(({ key, icon, label }) => (
          <button type="button"
            key={key}
            onClick={() => setStoryType(key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-sm font-label text-[10px] font-bold tracking-widest uppercase transition-all ${
              storyType === key
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container-low text-on-surface-variant border border-outline-variant/20 hover:border-primary/50'
            }`}
          >
            {icon} {label}
          </button>
        ))}
      </div>

      {/* Content area */}
      <div className="min-h-[400px]">
        {storyType === 'text' && (
          <div className="space-y-4">
            <div
              className="rounded-sm p-8 min-h-[300px] flex items-center justify-center transition-colors"
              style={{ backgroundColor: bgColor }}
            >
              <textarea
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder={t.stories?.writeStory || 'Write your story...'}
                className="w-full bg-transparent text-on-overlay text-2xl font-headline font-bold text-center focus:outline-none resize-none min-h-[200px] placeholder:text-on-overlay/50"
                maxLength={200}
              />
            </div>
            <div className="flex gap-2 justify-center">
              {COLORS.map(color => (
                <button type="button"
                  key={color}
                  onClick={() => setBgColor(color)}
                  className={`w-8 h-8 rounded-full border-2 transition-transform ${bgColor === color ? 'border-primary scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        )}

        {storyType === 'performance' && (
          <div className="bg-surface-container-low rounded-sm p-8 grid grid-cols-2 gap-8 max-w-sm mx-auto mt-12">
            <div className="flex flex-col items-center text-center">
              <Activity className="w-10 h-10 text-primary mb-3" />
              <span className="font-headline text-4xl font-black text-tertiary">{userPerformance.recovery}%</span>
              <span className="font-label text-xs tracking-widest text-primary uppercase mt-2">{t.community.recovery}</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <Activity className="w-10 h-10 text-brand-secondary mb-3" />
              <span className="font-headline text-4xl font-black text-tertiary">{userPerformance.strain}</span>
              <span className="font-label text-xs tracking-widest text-brand-secondary uppercase mt-2">{t.community.strain}</span>
            </div>
            <p className="col-span-2 text-center text-xs text-on-surface-variant mt-4">{t.stories?.performanceAuto || 'Auto-pulled from your latest data'}</p>
          </div>
        )}

        {storyType === 'recipe' && (
          <div className="space-y-4">
            {selectedRecipe ? (
              <div className="bg-surface-container-low rounded-sm overflow-hidden border border-outline-variant/20">
                {selectedRecipe.img && (
                  <img src={selectedRecipe.img} alt={selectedRecipe.title} className="w-full h-48 object-cover" referrerPolicy="no-referrer" />
                )}
                <div className="p-6">
                  <h3 className="font-headline font-bold text-xl uppercase text-tertiary">{selectedRecipe.title}</h3>
                  <div className="flex gap-4 mt-3">
                    <span className="font-label text-sm tracking-widest text-primary">{selectedRecipe.cal} kcal</span>
                    <span className="font-label text-sm tracking-widest text-on-surface-variant">{selectedRecipe.pro}g P</span>
                  </div>
                  <button type="button"
                    onClick={() => setSelectedRecipe(null)}
                    className="mt-4 text-xs text-on-surface-variant hover:text-error font-label tracking-widest uppercase"
                  >
                    {t.createPost.removeImage || 'Remove'}
                  </button>
                </div>
              </div>
            ) : (
              <button type="button"
                onClick={() => setShowRecipePicker(true)}
                className="w-full py-16 bg-surface-container-low border-2 border-dashed border-outline-variant/30 rounded-sm hover:border-primary/50 transition-colors flex flex-col items-center gap-3"
              >
                <ChefHat className="w-8 h-8 text-on-surface-variant" />
                <span className="font-label text-xs tracking-widest text-on-surface-variant uppercase">{t.createPost.selectRecipe}</span>
              </button>
            )}
          </div>
        )}

        {storyType === 'image' && (
          <div className="space-y-4">
            {image ? (
              <div className="relative rounded-sm overflow-hidden">
                <img src={image} alt="Preview" className="w-full max-h-[400px] object-cover" />
                <button type="button"
                  onClick={() => setImage(null)}
                  className="absolute top-3 right-3 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-on-overlay hover:bg-black/70 transition-colors"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="flex justify-center mt-12">
                <ImagePicker image={null} onImageChange={(base64) => { if (base64) setImage(base64); }} />
              </div>
            )}
          </div>
        )}
      </div>

      {showRecipePicker && (
        <RecipePicker
          recipes={savedRecipes}
          onSelect={(recipe) => { setSelectedRecipe(recipe); setShowRecipePicker(false); }}
          onClose={() => setShowRecipePicker(false)}
        />
      )}
    </PageShell>
  );
}
