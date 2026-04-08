import { useState } from 'react';
import { Search, Plus, Filter, Trash2, Clock, Flame, Link } from 'lucide-react';
import { useI18n } from '../i18n';
import { getFoodQuality, FOOD_QUALITY_EMOJI } from '../utils/nutrition';
import Planner from './Planner';
import ShoppingList from './ShoppingList';

export default function Cocina({ onAddMeal, onCreateRecipe, onNavigateToRecipe, savedRecipes = [], setSavedRecipes, mealPlan, shoppingList, setShoppingList, isPro, onImportUrl }: {
  onAddMeal: (dayIndex: number) => void;
  onCreateRecipe: () => void;
  onNavigateToRecipe?: (recipe: any) => void;
  savedRecipes?: any[];
  setSavedRecipes?: any;
  mealPlan: any;
  shoppingList: any[];
  setShoppingList: any;
  isPro?: boolean;
  onImportUrl?: () => void;
}) {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<'recipes' | 'plan' | 'list'>('recipes');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCollection, setActiveCollection] = useState('all');

  const collections = [
    { id: 'all', label: t.recipes.all, count: savedRecipes.length },
    { id: 'quick', label: t.recipes.quick, count: savedRecipes.filter(r => parseInt(r.prepTime) <= 15 || r.prepTime?.includes('5') || r.prepTime?.includes('10')).length },
    { id: 'high-protein', label: t.recipes.highProtein, count: savedRecipes.filter(r => r.macros?.protein >= 30).length },
    { id: 'imported', label: t.recipes.imported, count: savedRecipes.filter(r => r.tag === 'IMPORTADA').length },
  ];

  const filteredRecipes = savedRecipes.filter(r => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (!r.title?.toLowerCase().includes(q) && !r.tag?.toLowerCase().includes(q)) return false;
    }
    if (activeCollection === 'quick') return parseInt(r.prepTime) <= 15 || r.prepTime?.includes('5') || r.prepTime?.includes('10');
    if (activeCollection === 'high-protein') return r.macros?.protein >= 30;
    if (activeCollection === 'imported') return r.tag === 'IMPORTADA';
    return true;
  });

  const handleDeleteRecipe = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (setSavedRecipes) setSavedRecipes((prev: any[]) => prev.filter(r => r.id !== id));
  };

  const tabs = [
    { id: 'recipes' as const, label: t.tabs.recipes },
    { id: 'plan' as const, label: t.tabs.plan },
    { id: 'list' as const, label: t.tabs.list },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Sub-tabs */}
      <div className="flex border-b border-outline-variant/20 px-6 pt-2 shrink-0">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3 font-headline text-xs font-bold tracking-widest uppercase transition-colors border-b-2 ${
              activeTab === tab.id ? 'text-primary border-primary' : 'text-on-surface-variant border-transparent hover:text-tertiary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto pt-4">
        {/* RECIPES TAB */}
        {activeTab === 'recipes' && (
          <div className="px-6 max-w-5xl mx-auto space-y-6 pb-24">
            {/* Search + actions */}
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                <input
                  type="text"
                  placeholder={t.recipes.search}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-surface-container-low border border-outline-variant/20 rounded-sm text-on-surface placeholder:text-on-surface-variant text-sm font-body focus:outline-none focus:border-primary"
                />
              </div>
              <button onClick={onCreateRecipe} className="p-3 bg-primary text-on-primary rounded-sm hover:opacity-90 transition-opacity" title={t.recipes.create}>
                <Plus className="w-5 h-5" />
              </button>
              {onImportUrl && (
                <button onClick={onImportUrl} className="p-3 bg-surface-container-highest text-primary border border-outline-variant/20 rounded-sm hover:bg-primary/10 transition-colors" title={t.recipes.import}>
                  <Link className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Collections */}
            <div className="flex gap-2 overflow-x-auto hide-scrollbar -mx-6 px-6">
              {collections.map(col => (
                <button
                  key={col.id}
                  onClick={() => setActiveCollection(col.id)}
                  className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                    activeCollection === col.id
                      ? 'bg-primary text-on-primary'
                      : 'bg-surface-container-low border border-outline-variant/20 text-on-surface-variant hover:border-primary/50'
                  }`}
                >
                  {col.label} ({col.count})
                </button>
              ))}
            </div>

            {/* Recipe count */}
            {!isPro && (
              <div className="text-xs text-on-surface-variant font-label uppercase tracking-widest">
                {t.recipes.recipeCount.replace('{count}', String(savedRecipes.length))}
              </div>
            )}

            {/* Recipe grid */}
            {filteredRecipes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="text-4xl mb-4">📖</div>
                <p className="text-on-surface-variant font-body text-sm">{t.empty.recipesEmpty}</p>
                <div className="flex gap-3 mt-6">
                  <button onClick={onCreateRecipe} className="px-6 py-3 bg-primary text-on-primary rounded-sm font-headline text-xs font-bold uppercase tracking-widest">
                    {t.recipes.create}
                  </button>
                  {onImportUrl && (
                    <button onClick={onImportUrl} className="px-6 py-3 bg-surface-container-highest border border-outline-variant/20 text-primary rounded-sm font-headline text-xs font-bold uppercase tracking-widest">
                      {t.recipes.import}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredRecipes.map((recipe: any) => (
                  <button
                    key={recipe.id}
                    onClick={() => onNavigateToRecipe?.(recipe)}
                    className="bg-surface-container-low border border-outline-variant/20 rounded-sm overflow-hidden hover:border-primary/50 transition-all group text-left"
                  >
                    {recipe.img && (
                      <div className="aspect-video overflow-hidden">
                        <img src={recipe.img} alt={recipe.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="font-headline font-bold text-sm uppercase text-tertiary truncate">{recipe.title}</h3>
                      <div className="flex items-center gap-3 mt-2 text-xs text-on-surface-variant font-label">
                        <span>{recipe.macros?.calories || 0} {t.common.kcal}</span>
                        <span>P {recipe.macros?.protein || 0}{t.common.g}</span>
                        {recipe.prepTime && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{recipe.prepTime}</span>}
                        {recipe.macros && <span title={t.recipes.foodQuality[getFoodQuality(recipe.macros, recipe.micros?.others?.fiber)]}>{FOOD_QUALITY_EMOJI[getFoodQuality(recipe.macros, recipe.micros?.others?.fiber)]}</span>}
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded">{recipe.tag}</span>
                        <button onClick={(e) => handleDeleteRecipe(e, recipe.id)} className="text-on-surface-variant hover:text-red-500 transition-colors p-1">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PLAN TAB */}
        {activeTab === 'plan' && (
          <Planner onAddMeal={onAddMeal} mealPlan={mealPlan} />
        )}

        {/* LIST TAB */}
        {activeTab === 'list' && (
          <ShoppingList shoppingList={shoppingList} setShoppingList={setShoppingList} />
        )}
      </div>
    </div>
  );
}
