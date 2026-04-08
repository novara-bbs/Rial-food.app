import { X, Utensils, Activity, BookOpen, MessageSquare, Link, Camera } from 'lucide-react';
import { useI18n } from '../i18n';

export default function CreateModal({ isOpen, onClose, onSelect }: { isOpen: boolean, onClose: () => void, onSelect: (action: string) => void }) {
  const { t } = useI18n();

  if (!isOpen) return null;

  const actions = [
    { id: 'log-meal', label: t.fab.logMeal, icon: Utensils, color: 'primary' },
    { id: 'create-recipe', label: t.fab.createRecipe, icon: BookOpen, color: 'tertiary' },
    { id: 'import-url', label: t.fab.importUrl, icon: Link, color: 'primary' },
    { id: 'log-tolerance', label: t.fab.logTolerance, icon: Activity, color: 'secondary' },
    { id: 'post-update', label: t.fab.postUpdate, icon: MessageSquare, color: 'primary' },
    { id: 'scan-barcode', label: t.fab.scanBarcode, icon: Camera, color: 'tertiary' },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-surface-container w-full max-w-md rounded-t-2xl md:rounded-2xl border border-outline-variant/20 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 md:slide-in-from-bottom-0 md:zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-outline-variant/10 flex justify-between items-center">
          <h3 className="font-headline text-lg font-bold uppercase text-tertiary tracking-tight">{t.nav.create}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-4 grid grid-cols-2 gap-3">
          {actions.map(action => (
            <button
              key={action.id}
              onClick={() => onSelect(action.id)}
              className="bg-surface-container-low p-4 rounded-lg border border-outline-variant/20 hover:border-primary/50 hover:bg-surface-container-highest transition-all flex flex-col items-center justify-center gap-3 group"
            >
              <div className={`w-12 h-12 rounded-full bg-${action.color}/10 flex items-center justify-center text-${action.color} group-hover:scale-110 transition-transform`}>
                <action.icon className="w-6 h-6" />
              </div>
              <span className="font-headline font-bold text-[11px] uppercase tracking-widest text-tertiary text-center leading-tight">{action.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
