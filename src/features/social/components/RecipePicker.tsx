import { Search, X, ChefHat } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useI18n } from '../../../i18n';

interface RecipePickerProps {
  recipes: any[];
  onSelect: (recipe: { id: string; title: string; cal: number; pro: number; carbs: number; fats: number; time: string; img: string; tag: string }) => void;
  onClose: () => void;
}

export default function RecipePicker({ recipes, onSelect, onClose }: RecipePickerProps) {
  const { t } = useI18n();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return recipes.slice(0, 20);
    const q = search.toLowerCase();
    return recipes.filter((r: any) => r.title?.toLowerCase().includes(q)).slice(0, 20);
  }, [recipes, search]);

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-end justify-center">
      <div className="bg-surface-container-low border-t border-outline-variant/20 w-full max-w-2xl max-h-[70vh] rounded-t-lg overflow-hidden flex flex-col animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-outline-variant/10">
          <div className="flex items-center gap-2">
            <ChefHat className="w-5 h-5 text-primary" />
            <h3 className="font-headline font-bold text-sm uppercase text-tertiary tracking-widest">{t.createPost.selectRecipe}</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.createPost.searchRecipes}
              className="w-full pl-10 pr-4 py-2.5 bg-surface-container-highest border border-outline-variant/30 rounded-sm text-xs font-label tracking-widest uppercase text-tertiary placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
          {filtered.length === 0 ? (
            <p className="text-center text-xs text-on-surface-variant py-8">{t.createPost.noRecipesFound || 'No recipes found'}</p>
          ) : (
            filtered.map((recipe: any) => (
              <button
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
                className="w-full flex items-center gap-3 p-3 bg-background border border-outline-variant/20 rounded-sm hover:border-primary/50 transition-colors text-left"
              >
                {(recipe.img || recipe.image) && (
                  <img src={recipe.img || recipe.image} alt={recipe.title} className="w-12 h-12 rounded-sm object-cover shrink-0" referrerPolicy="no-referrer" />
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-headline font-bold text-[11px] uppercase text-tertiary truncate">{recipe.title}</h4>
                  <div className="flex gap-2 mt-1">
                    <span className="font-label text-[9px] tracking-widest text-primary">{recipe.macros?.calories || recipe.cal || 0} kcal</span>
                    <span className="font-label text-[9px] tracking-widest text-on-surface-variant">{recipe.macros?.protein || recipe.pro || 0}g P</span>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
