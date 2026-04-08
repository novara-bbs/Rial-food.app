import { ArrowLeft, CheckCircle2, Circle, Trash2, Plus, Share2, X, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useI18n } from '../i18n';
import EmptyState from '../components/EmptyState';
import { aggregateShoppingItems, groupShoppingItems, formatShoppingListForShare, detectCategory, AISLE_CATEGORIES } from '../utils/grocery';

export default function ShoppingList({ onBack, shoppingList = [], setShoppingList }: { onBack?: () => void, shoppingList?: any[], setShoppingList?: any }) {
  const { t } = useI18n();
  const [isAdding, setIsAdding] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<string>(AISLE_CATEGORIES.other);

  const toggleItem = (id: number) => {
    if (!setShoppingList) return;
    setShoppingList(shoppingList.map((item: any) => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  const clearCompleted = () => {
    if (!setShoppingList) return;
    setShoppingList(shoppingList.filter((item: any) => !item.checked));
    toast.success(t.shopping.completedCleared);
  };

  const clearAll = () => {
    if (!setShoppingList) return;
    setShoppingList([]);
    toast.success(t.shopping.listCleared);
  };

  const addItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || !setShoppingList) return;
    const autoCategory = detectCategory(newItemName) || newItemCategory;
    setShoppingList([...shoppingList, {
      id: Date.now(),
      name: newItemName.trim(),
      category: autoCategory,
      checked: false,
    }]);
    toast.success(`${newItemName} ${t.shopping.addedToList}`);
    setNewItemName('');
    setIsAdding(false);
  };

  const shareWhatsApp = () => {
    const text = formatShoppingListForShare(shoppingList);
    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encoded}`, '_blank', 'noopener,noreferrer');
  };

  const shareGeneric = () => {
    const text = formatShoppingListForShare(shoppingList);
    if (navigator.share) {
      navigator.share({ title: t.shopping.shareTitle, text }).catch(() => {
        navigator.clipboard.writeText(text);
        toast.success(t.shopping.copiedToClipboard);
      });
    } else {
      navigator.clipboard.writeText(text);
      toast.success(t.shopping.copiedToClipboard);
    }
  };

  // Aggregate (dedup) then group
  const aggregated = aggregateShoppingItems(shoppingList);
  const groups = groupShoppingItems(aggregated);
  const hasItems = aggregated.length > 0;
  const completedCount = aggregated.filter(i => i.checked).length;

  const CATEGORY_DISPLAY = [
    AISLE_CATEGORIES.vegetables,
    AISLE_CATEGORIES.fruits,
    AISLE_CATEGORIES.meat,
    AISLE_CATEGORIES.dairy,
    AISLE_CATEGORIES.grains,
    AISLE_CATEGORIES.pantry,
    AISLE_CATEGORIES.spices,
    AISLE_CATEGORIES.frozen,
    AISLE_CATEGORIES.beverages,
    AISLE_CATEGORIES.other,
  ];

  return (
    <div className="px-6 max-w-4xl mx-auto space-y-8 pb-32">
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          {onBack && (
            <button onClick={onBack} aria-label={t.common.back} className="w-10 h-10 bg-surface-container-low rounded-full flex items-center justify-center text-tertiary hover:bg-surface-container-highest transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <span className="font-label text-xs tracking-[0.2em] text-primary uppercase block">{t.shoppingList.title}</span>
            <h2 className="font-headline text-3xl font-bold tracking-tighter uppercase text-tertiary">{t.shoppingList.title}</h2>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={shareWhatsApp} disabled={!hasItems} aria-label="WhatsApp" title="Compartir por WhatsApp" className="w-10 h-10 bg-surface-container-low rounded-full flex items-center justify-center text-on-surface-variant hover:text-green-500 transition-colors border border-outline-variant/20 disabled:opacity-30">
            <MessageCircle className="w-4 h-4" />
          </button>
          <button onClick={shareGeneric} disabled={!hasItems} aria-label={t.shopping.share} className="w-10 h-10 bg-surface-container-low rounded-full flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors border border-outline-variant/20 disabled:opacity-30">
            <Share2 className="w-4 h-4" />
          </button>
          <button onClick={clearAll} disabled={!hasItems} aria-label={t.shoppingList.clearAll} className="w-10 h-10 bg-surface-container-low rounded-full flex items-center justify-center text-on-surface-variant hover:text-error transition-colors border border-outline-variant/20 disabled:opacity-30">
            <Trash2 className="w-4 h-4" />
          </button>
          <button onClick={() => setIsAdding(true)} aria-label={t.shoppingList.addItem} className="w-10 h-10 bg-primary text-on-primary rounded-full flex items-center justify-center hover:bg-primary-container transition-colors shadow-lg">
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Progress bar */}
      {hasItems && (
        <div className="bg-surface-container-low border border-outline-variant/20 rounded-sm p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="font-label text-xs uppercase tracking-widest text-on-surface-variant">{t.shoppingList.title}</span>
            <span className="font-headline text-sm font-bold text-primary">{completedCount}/{aggregated.length}</span>
          </div>
          <div className="w-full bg-surface-container-highest rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-500"
              style={{ width: `${aggregated.length > 0 ? (completedCount / aggregated.length) * 100 : 0}%` }}
            />
          </div>
        </div>
      )}

      {/* Add item form */}
      {isAdding && (
        <div className="bg-surface-container-high p-6 rounded-2xl border border-primary/30 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-headline text-sm font-bold uppercase tracking-widest text-primary">{t.shoppingList.addItem}</h3>
            <button onClick={() => setIsAdding(false)} aria-label={t.common.cancel} className="text-on-surface-variant hover:text-tertiary">
              <X className="w-4 h-4" />
            </button>
          </div>
          <form onSubmit={addItem} className="space-y-4">
            <input
              autoFocus
              type="text"
              placeholder={t.shopping.itemName}
              aria-label={t.shopping.itemName}
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              className="w-full bg-surface-container-low border border-outline-variant/30 p-3 rounded-lg text-tertiary placeholder:text-outline focus:outline-none focus:border-primary transition-colors"
            />
            <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar" role="group" aria-label={t.shopping.category}>
              {CATEGORY_DISPLAY.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setNewItemCategory(cat)}
                  aria-pressed={newItemCategory === cat}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-colors ${
                    newItemCategory === cat ? 'bg-primary text-on-primary' : 'bg-surface-container-highest text-on-surface-variant'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <button type="submit" disabled={!newItemName.trim()} className="w-full bg-primary text-on-primary py-3 rounded-lg font-headline font-bold text-xs uppercase tracking-widest hover:bg-primary-container transition-colors disabled:opacity-50">
              {t.shopping.add}
            </button>
          </form>
        </div>
      )}

      {/* List grouped by aisle */}
      <div className="space-y-8">
        {groups.map(({ category, items }) => {
          const unchecked = items.filter(i => !i.checked);
          const checked = items.filter(i => i.checked);
          if (!items.length) return null;

          return (
            <section key={category}>
              <h3 className="font-headline text-base font-bold tracking-tight uppercase text-on-surface-variant mb-3 border-b border-outline-variant/20 pb-2 flex justify-between items-center">
                <span>{category}</span>
                <span className="text-[10px] font-black opacity-40">{unchecked.length}/{items.length}</span>
              </h3>
              <div className="space-y-2">
                {[...unchecked, ...checked].map((item: any) => (
                  <button
                    key={item.id}
                    onClick={() => toggleItem(item.id)}
                    aria-pressed={item.checked}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-left group ${
                      item.checked
                        ? 'bg-surface-container border-outline-variant/10 opacity-60'
                        : 'bg-surface-container-low border-outline-variant/20 hover:border-primary/30'
                    }`}
                  >
                    {item.checked
                      ? <CheckCircle2 className="w-6 h-6 text-primary shrink-0" />
                      : <Circle className="w-6 h-6 text-on-surface-variant shrink-0 group-hover:text-primary transition-colors" />
                    }
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-base font-medium transition-all ${item.checked ? 'text-on-surface-variant line-through' : 'text-tertiary'}`}>
                          {item.name}
                        </span>
                        {item.quantity && (
                          <span className="text-[9px] font-bold uppercase tracking-wider bg-surface-container-highest text-on-surface-variant px-2 py-0.5 rounded-full">
                            {item.quantity}{item.unit || ''}
                          </span>
                        )}
                      </div>
                      {/* Recipe source badges */}
                      {item.source && item.source.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {item.source.slice(0, 2).map((src: string, idx: number) => (
                            <span key={idx} className="text-[8px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                              {src}
                            </span>
                          ))}
                          {item.source.length > 2 && (
                            <span className="text-[8px] font-bold uppercase tracking-wider text-on-surface-variant">+{item.source.length - 2}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </section>
          );
        })}

        {!hasItems && !isAdding && (
          <EmptyState
            icon="🛒"
            description={t.shoppingList.emptyState}
            ctaLabel={t.shoppingList.addItem}
            onCta={() => setIsAdding(true)}
          />
        )}
      </div>

      {/* Clear completed FAB */}
      {completedCount > 0 && (
        <div className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 w-full max-w-md px-6 z-50">
          <button
            onClick={clearCompleted}
            className="w-full bg-surface-container-highest text-error border border-error/20 py-4 rounded-full font-headline font-bold text-sm uppercase tracking-widest hover:bg-error/10 transition-colors flex items-center justify-center gap-2 shadow-xl backdrop-blur-md"
          >
            <Trash2 className="w-4 h-4" /> {t.shoppingList.clearCompleted}
          </button>
        </div>
      )}
    </div>
  );
}
