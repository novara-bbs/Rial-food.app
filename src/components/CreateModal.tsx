import { Utensils, Activity, BookOpen, MessageSquare, Link, Camera } from 'lucide-react';
import { useI18n } from '../i18n';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

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
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent
        showCloseButton={false}
        className="bg-surface-container w-full max-w-md rounded-t-2xl md:rounded-2xl border border-outline-variant/20 shadow-2xl p-0 gap-0"
      >
        <DialogHeader className="p-4 border-b border-outline-variant/10 flex-row justify-between items-center space-y-0">
          <DialogTitle className="font-headline text-lg font-bold uppercase text-tertiary tracking-tight">
            {t.nav.create}
          </DialogTitle>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            className="rounded-full bg-surface-container-highest text-on-surface-variant hover:text-primary"
          >
            <span className="sr-only">Close</span>
            &times;
          </Button>
        </DialogHeader>
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
      </DialogContent>
    </Dialog>
  );
}
