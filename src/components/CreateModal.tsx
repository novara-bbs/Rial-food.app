import { Utensils, Activity, BookOpen, MessageSquare, Link, Camera } from 'lucide-react';
import { useI18n } from '../i18n';
import BottomSheet from '@/components/ui/bottom-sheet';

export default function CreateModal({ isOpen, onClose, onSelect }: { isOpen: boolean, onClose: () => void, onSelect: (action: string) => void }) {
  const { t } = useI18n();

  const actions = [
    { id: 'log-meal', label: t.fab.logMeal, icon: Utensils, color: 'primary' },
    { id: 'create-recipe', label: t.fab.createRecipe, icon: BookOpen, color: 'tertiary' },
    { id: 'import-url', label: t.fab.importUrl, icon: Link, color: 'primary' },
    { id: 'log-tolerance', label: t.fab.logTolerance, icon: Activity, color: 'secondary' },
    { id: 'post-update', label: t.fab.postUpdate, icon: MessageSquare, color: 'primary' },
    { id: 'scan-barcode', label: t.fab.scanBarcode, icon: Camera, color: 'tertiary' },
  ];

  return (
    <BottomSheet
      open={isOpen}
      onOpenChange={(open) => { if (!open) onClose(); }}
      title={t.nav.create}
    >
      <div className="grid grid-cols-2 gap-3 pt-2">
        {actions.map(action => (
          <button
            type="button"
            key={action.id}
            onClick={() => onSelect(action.id)}
            className="bg-surface-container-low p-4 rounded-sm border border-outline-variant/20 hover:border-primary/50 hover:bg-surface-container-highest transition-all flex flex-col items-center justify-center gap-3 group min-h-11"
          >
            <div className={`w-12 h-12 rounded-full bg-${action.color}/10 flex items-center justify-center text-${action.color} group-hover:scale-110 transition-transform`}>
              <action.icon className="w-6 h-6" />
            </div>
            <span className="font-headline font-bold text-caption uppercase tracking-widest text-tertiary text-center leading-tight">{action.label}</span>
          </button>
        ))}
      </div>
    </BottomSheet>
  );
}
