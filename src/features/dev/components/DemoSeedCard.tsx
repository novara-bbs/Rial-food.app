import { useState } from 'react';
import { Sparkles, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAppState } from '../../../contexts/AppStateContext';
import { Heading } from '@/components/ui/Typography';

interface DemoSeedCardProps {
  /**
   * In dev mode the card is always visible. In prod it only shows when
   * the long-press gate has been unlocked via GlobalHeader avatar.
   */
  forceVisible?: boolean;
}

/**
 * Dev utility card — "Modo demo · Rial con Clara".
 * One-click load of a full 30-day coherent fixture so any screen can be
 * tested realistically (Home, Progress, WeeklyReview, diario, community).
 */
export default function DemoSeedCard({ forceVisible = false }: DemoSeedCardProps) {
  const { handleLoadDemoSeed, handleClearDemoSeed } = useAppState();
  const [busy, setBusy] = useState<'load' | 'clear' | null>(null);

  const isDev = (import.meta as any).env?.DEV === true;
  if (!isDev && !forceVisible) return null;
  if (!handleLoadDemoSeed || !handleClearDemoSeed) return null;

  const onLoad = async () => {
    if (busy) return;
    setBusy('load');
    try {
      await handleLoadDemoSeed();
      toast.success('Demo Rial cargado — Clara, 30 días Cut');
    } catch (err) {
      toast.error('No se pudo cargar el demo');
      // eslint-disable-next-line no-console
      console.error(err);
    } finally {
      setBusy(null);
    }
  };

  const onClear = () => {
    if (busy) return;
    setBusy('clear');
    try {
      handleClearDemoSeed();
      toast.success('Datos demo eliminados');
    } finally {
      setBusy(null);
    }
  };

  return (
    <section className="bg-surface-container-low border border-dashed border-brand-secondary/40 rounded-sm p-5 space-y-3">
      <div className="flex items-start gap-2">
        <Sparkles className="w-4 h-4 text-brand-secondary shrink-0 mt-0.5" aria-hidden="true" />
        <div className="flex-1 min-w-0">
          <Heading level="h4" className="tracking-widest">Modo demo · Rial</Heading>
          <p className="text-caption text-on-surface-variant mt-1 leading-relaxed">
            Carga 30 días coherentes con <strong>Clara</strong> (ICP Cut): peso 72.4 → 69.1 kg,
            macros, hidratación, movimiento, fotos de progreso, reflexiones semanales y posts.
            Sobrescribe tus datos actuales.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 pt-1">
        <button
          type="button"
          onClick={onLoad}
          disabled={busy !== null}
          className="flex items-center justify-center gap-2 bg-brand-secondary text-on-primary px-3 py-2 rounded-sm text-micro font-bold uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-40"
        >
          {busy === 'load' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
          Cargar demo
        </button>
        <button
          type="button"
          onClick={onClear}
          disabled={busy !== null}
          className="flex items-center justify-center gap-2 bg-surface-container border border-outline-variant/30 text-on-surface-variant px-3 py-2 rounded-sm text-micro font-bold uppercase tracking-widest hover:border-error/40 hover:text-error transition-colors disabled:opacity-40"
        >
          {busy === 'clear' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
          Limpiar
        </button>
      </div>
    </section>
  );
}
