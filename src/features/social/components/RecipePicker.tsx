import { Search, ChefHat } from 'lucide-react';
import { useState, useMemo } from 'react';
import BottomSheet from '@/components/ui/bottom-sheet';
import { useI18n } from '../../../i18n';
import { Heading } from '@/components/ui/Typography';

interface RecipePickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipes: any[];
  onSelect: (recipe: { id: string; title: string; cal: number; pro: number; carbs: number; fats: number; time: string; img: string; tag: string }) => void;
}

export default function RecipePicker({ open, onOpenChange, recipes, onSelect }: RecipePickerProps) {
  const { t } = useI18n();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return recipes.slice(0, 20);
    const q = search.toLowerCase();
    return recipes.filter((r: any) => r.title?.toLowerCase().includes(q)).slice(0, 20);
  }, [recipes, search]);

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title={t.createPost.selectRecipe}
      size="focus"
      actionSlot={<ChefHat className="w-5 h-5 text-primary" aria-hidden="true" />}
    >
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" aria-hidden="true" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.createPost.searchRecipes}
            className="w-full pl-10 pr-4 min-h-11 bg-surface-container-highest border border-outline-variant/30 rounded-sm text-caption font-label tracking-widest uppercase text-tertiary placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary"
          />
        </div>

        <div className="space-y-2">
          {filtered.length === 0 ? (
            <p className="text-center text-caption text-on-surface-variant py-8">{t.createPost.noRecipesFound}</p>
          ) : (
            filtered.map((recipe: any) => (
              <button
                type="button"
                key={recipe.id}
                onClick={() => onSelect({
                  id: String(recipe.id),
                  title: recipe.title,
                  cal: recipe.macros?.calories || recipe.cal || 0,
                  pro: recipe.macros?.protein || recipe.pro || 0,
                  carbs: recipe.macros?.carbs || recipe.carbs || 0,
                  fats: recipe.macros?.fats || recipe.fats || 0,
                  time: recipe.prepTime ? `${recipe.prepTime + (recipe.cookTime || 0)}M` : '—',
                  img: recipe.img || recipe.image || '',
                  tag: recipe.tags?.[0] || recipe.category || '',
                })}
                className="w-full min-h-11 flex items-center gap-3 p-3 bg-background border border-outline-variant/20 rounded-sm hover:border-primary/50 transition-colors text-left"
              >
                {(recipe.img || recipe.image) && (
                  <img src={recipe.img || recipe.image} alt="" className="w-12 h-12 rounded-sm object-cover shrink-0" referrerPolicy="no-referrer" />
                )}
                <div className="flex-1 min-w-0">
                  <Heading level="h4" className="text-caption truncate">{recipe.title}</Heading>
                  <div className="flex gap-2 mt-1">
                    <span className="font-label text-micro tracking-widest text-primary">{recipe.macros?.calories || recipe.cal || 0} kcal</span>
                    <span className="font-label text-micro tracking-widest text-on-surface-variant">{recipe.macros?.protein || recipe.pro || 0}g P</span>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </BottomSheet>
  );
}
