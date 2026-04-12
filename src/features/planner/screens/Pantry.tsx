import { Plus, Trash2, X, Package } from 'lucide-react';
import PageShell from '../../../components/PageShell';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { useI18n } from '../../../i18n';
import EmptyState from '../../../components/EmptyState';
import PageHeader from '../../../components/patterns/PageHeader';
import { useLocalStorageState } from '../../../hooks/useLocalStorageState';
import { detectCategory, groupShoppingItems } from '../utils/grocery';

interface PantryItem {
  id: number;
  name: string;
  category: string;
  quantity: string; // free-form: "500g", "1 bag", etc.
  addedAt: string;
}

export default function Pantry({ onBack }: { onBack: () => void }) {
  const { t } = useI18n();
  const [pantryItems, setPantryItems] = useLocalStorageState<PantryItem[]>('pantryItems', [
    { id: 1, name: 'Quinoa', category: 'Cereales y Pan', quantity: '500g', addedAt: new Date().toISOString() },
    { id: 2, name: 'Aceite de Oliva', category: 'Despensa', quantity: '1 botella', addedAt: new Date().toISOString() },
    { id: 3, name: 'Almendras', category: 'Despensa', quantity: '200g', addedAt: new Date().toISOString() },
  ]);
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newQuantity, setNewQuantity] = useState('');

  const addItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const category = detectCategory(newName);
    setPantryItems(prev => [
      { id: Date.now(), name: newName.trim(), category, quantity: newQuantity.trim() || '—', addedAt: new Date().toISOString() },
      ...prev,
    ]);
    toast.success(`${newName} ${t.pantry.addedToPantry}`);
    setNewName('');
    setNewQuantity('');
    setIsAdding(false);
  };

  const removeItem = (id: number) => {
    setPantryItems(prev => prev.filter(i => i.id !== id));
    toast.success(t.pantry.removedFromPantry);
  };

  const groups = groupShoppingItems(pantryItems.map(i => ({ id: i.id, name: i.name, category: i.category, checked: false })));

  return (
    <PageShell maxWidth="narrow" spacing="lg">
      <PageHeader
        onBack={onBack}
        title={t.pantry.title}
        rightAction={
          <button type="button" onClick={() => setIsAdding(true)} className="w-10 h-10 bg-primary text-on-primary rounded-full flex items-center justify-center hover:bg-primary-container transition-colors shadow-lg">
            <Plus className="w-5 h-5" />
          </button>
        }
      />

      <p className="text-sm text-on-surface-variant font-body leading-relaxed">
        {t.pantry.description}
      </p>

      {/* Add form */}
      {isAdding && (
        <div className="bg-surface-container-high p-6 rounded-sm border border-primary/30 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-headline text-sm font-bold uppercase tracking-widest text-primary">{t.pantry.addToPantry}</h3>
            <button type="button" onClick={() => setIsAdding(false)} className="text-on-surface-variant hover:text-tertiary">
              <X className="w-4 h-4" />
            </button>
          </div>
          <form onSubmit={addItem} className="space-y-3">
            <input
              autoFocus
              type="text"
              placeholder={t.pantry.ingredientName}
              value={newName}
              onChange={e => setNewName(e.target.value)}
              className="w-full bg-surface-container-low border border-outline-variant/30 p-3 rounded-sm text-tertiary placeholder:text-outline focus:outline-none focus:border-primary transition-colors"
            />
            <input
              type="text"
              placeholder={t.pantry.quantity}
              value={newQuantity}
              onChange={e => setNewQuantity(e.target.value)}
              className="w-full bg-surface-container-low border border-outline-variant/30 p-3 rounded-sm text-tertiary placeholder:text-outline focus:outline-none focus:border-primary transition-colors"
            />
            <button
              type="submit"
              disabled={!newName.trim()}
              className="w-full bg-primary text-on-primary py-3 rounded-sm font-headline font-bold text-xs uppercase tracking-widest hover:bg-primary-container transition-colors disabled:opacity-50"
            >
              {t.pantry.add}
            </button>
          </form>
        </div>
      )}

      {/* Grouped by category */}
      <div className="space-y-8">
        {groups.map(({ category, items }) => (
          <section key={category}>
            <h3 className="font-headline text-base font-bold tracking-tight uppercase text-on-surface-variant mb-3 border-b border-outline-variant/20 pb-2 flex justify-between items-center">
              <span>{category}</span>
              <span className="text-[10px] font-black opacity-40">{items.length}</span>
            </h3>
            <div className="space-y-2">
              {items.map(item => {
                const pantryItem = pantryItems.find(p => p.id === item.id);
                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 p-4 bg-surface-container-low border border-outline-variant/20 rounded-sm group hover:border-primary/30 transition-colors"
                  >
                    <Package className="w-5 h-5 text-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-headline font-bold text-base uppercase text-tertiary">{item.name}</p>
                      {pantryItem?.quantity && pantryItem.quantity !== '—' && (
                        <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mt-0.5">{pantryItem.quantity}</p>
                      )}
                    </div>
                    <button type="button"
                      onClick={() => removeItem(item.id)}
                      className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface-variant hover:text-error transition-colors opacity-0 group-hover:opacity-100"
                      aria-label={`${t.pantry.deleteItem} ${item.name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        ))}

        {pantryItems.length === 0 && !isAdding && (
          <EmptyState
            icon="🗄️"
            title={t.pantry.emptyTitle}
            description={t.pantry.emptyDescription}
            ctaLabel={t.pantry.addIngredient}
            onCta={() => setIsAdding(true)}
          />
        )}
      </div>
    </PageShell>
  );
}
