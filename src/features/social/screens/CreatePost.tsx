import { Send, Activity, TrendingUp, ChefHat, X } from 'lucide-react';
import PageShell from '../../../components/PageShell';
import { useState } from 'react';
import { useI18n } from '../../../i18n';
import { useAppState } from '../../../contexts/AppStateContext';
import ImagePicker from '../components/ImagePicker';
import RecipePicker from '../components/RecipePicker';
import PageHeader from '../../../components/patterns/PageHeader';

export default function CreatePost({ onBack, onCreatePost }: { onBack: () => void, onCreatePost?: (content: string, performance?: any, options?: { images?: string[]; recipe?: any; hashtags?: string[] }) => void }) {
  const { t } = useI18n();
  const { savedRecipes } = useAppState();
  const [content, setContent] = useState('');
  const [attachPerformance, setAttachPerformance] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [attachedRecipe, setAttachedRecipe] = useState<any>(null);
  const [showRecipePicker, setShowRecipePicker] = useState(false);
  const userPerformance = { recovery: 82, strain: 14.5 };

  const handlePublish = () => {
    onCreatePost?.(
      content,
      attachPerformance ? userPerformance : undefined,
      {
        images: image ? [image] : [],
        recipe: attachedRecipe,
      }
    );
  };

  return (
    <PageShell maxWidth="narrow" spacing="md">
      <PageHeader
        onBack={onBack}
        label={t.createPost.community}
        title={t.createPost.title}
        rightAction={
          <button type="button"
            onClick={handlePublish}
            disabled={!content.trim()}
            className="bg-primary text-on-primary px-4 py-2 rounded-sm font-label text-xs font-bold tracking-widest uppercase flex items-center gap-2 hover:bg-primary-container transition-colors disabled:opacity-50"
          >
            <Send className="w-4 h-4" /> {t.common.publish}
          </button>
        }
      />

      <div className="bg-surface-container-low rounded-sm border border-outline-variant/20 overflow-hidden">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={t.createPost.placeholder}
          className="w-full bg-transparent p-6 font-body text-lg text-tertiary focus:outline-none placeholder:text-outline-variant min-h-[200px] resize-none"
        />

        {/* Image preview */}
        {image && (
          <div className="px-6 pb-4">
            <div className="relative rounded-sm overflow-hidden border border-outline-variant/20">
              <img src={image} alt="Preview" className="w-full max-h-48 object-cover" />
              <button type="button" onClick={() => setImage(null)} className="absolute top-2 right-2 w-7 h-7 bg-surface-container-highest/90 rounded-full flex items-center justify-center text-on-surface-variant hover:text-error transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Attached recipe preview */}
        {attachedRecipe && (
          <div className="px-6 pb-4">
            <div className="bg-background rounded-sm border border-primary/30 p-3 flex items-center gap-3 relative">
              <button type="button" onClick={() => setAttachedRecipe(null)} className="absolute -top-2 -right-2 w-6 h-6 bg-error text-on-error rounded-full flex items-center justify-center text-[10px] font-bold shadow-lg">X</button>
              {attachedRecipe.img && (
                <img src={attachedRecipe.img} alt={attachedRecipe.title} className="w-12 h-12 rounded-sm object-cover" referrerPolicy="no-referrer" />
              )}
              <div>
                <span className="font-headline font-bold text-xs uppercase text-tertiary">{attachedRecipe.title}</span>
                <span className="font-label text-[9px] tracking-widest text-on-surface-variant block mt-0.5">{attachedRecipe.cal} kcal · {attachedRecipe.pro}g P</span>
              </div>
            </div>
          </div>
        )}

        {/* Performance preview */}
        {attachPerformance && (
          <div className="px-6 pb-6">
            <div className="bg-background rounded-sm border border-primary/30 p-4 grid grid-cols-2 gap-4 relative">
              <button type="button" onClick={() => setAttachPerformance(false)} className="absolute -top-2 -right-2 w-6 h-6 bg-error text-on-error rounded-full flex items-center justify-center text-[10px] font-bold shadow-lg">X</button>
              <div className="flex flex-col items-center justify-center text-center p-2">
                <Activity className="w-5 h-5 text-primary mb-1" />
                <span className="font-headline text-xl font-bold text-tertiary">{userPerformance.recovery}%</span>
                <span className="font-label text-[10px] tracking-widest text-primary uppercase">{t.community.recovery}</span>
              </div>
              <div className="flex flex-col items-center justify-center text-center p-2 border-l border-outline-variant/20">
                <TrendingUp className="w-5 h-5 text-brand-secondary mb-1" />
                <span className="font-headline text-xl font-bold text-tertiary">{userPerformance.strain}</span>
                <span className="font-label text-[10px] tracking-widest text-brand-secondary uppercase">{t.community.strain}</span>
              </div>
            </div>
          </div>
        )}

        {/* Action bar */}
        <div className="border-t border-outline-variant/10 p-4 bg-surface-container-highest flex items-center gap-4">
          <ImagePicker image={null} onImageChange={(base64) => base64 && setImage(base64)} />
          <button type="button"
            onClick={() => setShowRecipePicker(true)}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${attachedRecipe ? 'bg-primary text-on-primary' : 'bg-surface-container-low text-on-surface-variant hover:text-primary hover:bg-primary/10'}`}
            aria-label={t.createPost.addRecipe}
          >
            <ChefHat className="w-5 h-5" />
          </button>
          <button type="button"
            onClick={() => setAttachPerformance(!attachPerformance)}
            aria-label={t.createPost.includePerformance}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${attachPerformance ? 'bg-primary text-on-primary' : 'bg-surface-container-low text-on-surface-variant hover:text-primary hover:bg-primary/10'}`}
          >
            <Activity className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          <span className="font-label text-xs font-bold tracking-widest text-outline-variant uppercase">{content.length} / 500</span>
        </div>
      </div>

      {showRecipePicker && (
        <RecipePicker
          recipes={savedRecipes}
          onSelect={(recipe) => { setAttachedRecipe(recipe); setShowRecipePicker(false); }}
          onClose={() => setShowRecipePicker(false)}
        />
      )}
    </PageShell>
  );
}
