import { Send, Globe } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useI18n } from '../../../i18n';
import { useAppState } from '../../../contexts/AppStateContext';
import BottomSheet from '../../../components/ui/bottom-sheet';

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
    toast.success(t.recipeDetail.published);
    onClose();
  };

  return (
    <BottomSheet
      open={true}
      onOpenChange={(o) => { if (!o) onClose(); }}
      title={t.recipeDetail.shareToFeed}
      actionSlot={<Globe className="w-5 h-5 text-primary" aria-hidden="true" />}
      footer={
        <button
          type="button"
          onClick={handlePublish}
          className="w-full min-h-11 bg-primary text-on-primary rounded-sm font-headline text-caption font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
        >
          <Send className="w-4 h-4" /> {t.recipeDetail.shareToFeed}
        </button>
      }
    >
      <div className="space-y-4 pt-2">
        <div className="bg-background rounded-sm border border-outline-variant/20 p-3 flex items-center gap-3">
          {(recipe.img || recipe.image) && (
            <img
              src={recipe.img || recipe.image}
              alt={recipe.title}
              className="w-14 h-14 rounded-sm object-cover"
              referrerPolicy="no-referrer"
            />
          )}
          <div>
            <h4 className="font-headline font-bold text-caption uppercase text-tertiary">{recipe.title}</h4>
            <div className="flex gap-2 mt-1">
              <span className="font-label text-micro tracking-widest text-primary">
                {recipe.macros?.calories || recipe.cal || 0} kcal
              </span>
              <span className="font-label text-micro tracking-widest text-on-surface-variant">
                {recipe.macros?.protein || recipe.pro || 0}g P
              </span>
            </div>
          </div>
        </div>

        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder={t.recipeDetail.publishCaption}
          aria-label={t.recipeDetail.publishCaption}
          className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-sm p-3 text-caption font-body text-tertiary placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary resize-none min-h-[80px]"
          maxLength={300}
        />
      </div>
    </BottomSheet>
  );
}
