import { X, Send, Globe } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useI18n } from '../../../i18n';
import { useAppState } from '../../../contexts/AppStateContext';

interface PublishRecipeSheetProps {
  recipe: any;
  onClose: () => void;
}

export default function PublishRecipeSheet({ recipe, onClose }: PublishRecipeSheetProps) {
  const { t } = useI18n();
  const { handleCreatePost } = useAppState();
  const [caption, setCaption] = useState('');

  const handlePublish = () => {
    const recipePayload = {
      id: String(recipe.id),
      title: recipe.title,
      cal: recipe.macros?.calories || recipe.cal || 0,
      pro: recipe.macros?.protein || recipe.pro || 0,
      carbs: recipe.macros?.carbs || recipe.carbs || 0,
      fats: recipe.macros?.fats || recipe.fats || 0,
      time: recipe.prepTime ? `${recipe.prepTime + (recipe.cookTime || 0)}M` : '—',
      img: recipe.img || recipe.image || '',
      tag: recipe.tags?.[0] || recipe.category || '',
    };
    handleCreatePost(
      caption || `${recipe.title}`,
      undefined,
      { recipe: recipePayload }
    );
    toast.success(t.recipeDetail?.published || 'Published!');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-end justify-center" onClick={onClose}>
      <div className="bg-surface-container-low border-t border-outline-variant/20 w-full max-w-md rounded-t-lg overflow-hidden animate-in slide-in-from-bottom duration-300" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-outline-variant/10">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            <h3 className="font-headline font-bold text-sm uppercase text-tertiary tracking-widest">{t.recipeDetail?.shareToFeed || 'Share to community'}</h3>
          </div>
          <button type="button" onClick={onClose} className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface-variant hover:text-primary">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Recipe preview */}
        <div className="p-4">
          <div className="bg-background rounded-sm border border-outline-variant/20 p-3 flex items-center gap-3">
            {(recipe.img || recipe.image) && (
              <img src={recipe.img || recipe.image} alt={recipe.title} className="w-14 h-14 rounded-sm object-cover" referrerPolicy="no-referrer" />
            )}
            <div>
              <h4 className="font-headline font-bold text-xs uppercase text-tertiary">{recipe.title}</h4>
              <div className="flex gap-2 mt-1">
                <span className="font-label text-[9px] tracking-widest text-primary">{recipe.macros?.calories || recipe.cal || 0} kcal</span>
                <span className="font-label text-[9px] tracking-widest text-on-surface-variant">{recipe.macros?.protein || recipe.pro || 0}g P</span>
              </div>
            </div>
          </div>
        </div>

        {/* Caption */}
        <div className="px-4 pb-4">
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder={t.recipeDetail?.publishCaption || 'Add a caption...'}
            className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-sm p-3 text-xs font-body text-tertiary placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary resize-none min-h-[80px]"
            maxLength={300}
          />
        </div>

        <div className="px-4 pb-4">
          <button type="button"
            onClick={handlePublish}
            className="w-full py-3 bg-primary text-on-primary rounded-sm font-headline text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
          >
            <Send className="w-4 h-4" /> {t.recipeDetail?.shareToFeed || 'Share'}
          </button>
        </div>
      </div>
    </div>
  );
}
