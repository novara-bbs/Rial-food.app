import { useState } from 'react';
import { Trash2, Pencil, Scale, Camera } from 'lucide-react';
import BottomSheet from '@/components/ui/bottom-sheet';
import { useI18n } from '../../../i18n';
import { useAppState } from '../../../contexts/AppStateContext';
import { bodyWeightFromKg, getBodyWeightUnit, type UnitSystem } from '../../food/utils/units';
import type { BodySnapshot } from '../../../types/wellness';
import LogSnapshotModal from './LogSnapshotModal';

interface SnapshotDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  snapshot: BodySnapshot | null;
  unitSystem: UnitSystem;
}

export default function SnapshotDetailModal({ open, onOpenChange, snapshot, unitSystem }: SnapshotDetailModalProps) {
  const { t } = useI18n();
  const { handleDeleteSnapshot } = useAppState();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  if (!snapshot) return null;

  const unit = getBodyWeightUnit(unitSystem);
  const displayKg = snapshot.kg > 0 ? bodyWeightFromKg(snapshot.kg, unitSystem) : null;
  const dateLabel = new Date(snapshot.date + 'T12:00:00').toLocaleDateString(undefined, {
    day: 'numeric', month: 'long', year: 'numeric', weekday: 'long',
  });
  const m = snapshot.measurements ?? {};
  const hasMeasurements = Object.values(m).some(v => v != null);

  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    handleDeleteSnapshot(snapshot.date);
    setConfirmDelete(false);
    onOpenChange(false);
  };

  const p = t.progress;

  return (
    <>
      <BottomSheet
        open={open && !editOpen}
        onOpenChange={v => { if (!v) setConfirmDelete(false); onOpenChange(v); }}
        title={dateLabel}
        size="focus"
        headerLayout="title-centered"
        footer={
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setEditOpen(true)}
              className="min-h-11 py-2.5 text-caption font-bold uppercase tracking-widest bg-primary/10 text-primary rounded-sm hover:bg-primary/20 transition-colors flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
              {p.edit ?? 'Editar'}
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className={`min-h-11 py-2.5 text-caption font-bold uppercase tracking-widest rounded-sm transition-colors flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                confirmDelete
                  ? 'bg-error text-white hover:bg-error/90'
                  : 'bg-surface-container-highest text-on-surface-variant hover:bg-error/10 hover:text-error'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
              {confirmDelete ? (p.confirmDelete ?? '¿Confirmar?') : (p.delete ?? 'Eliminar')}
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          {/* Photo or icon */}
          {snapshot.photoUrl ? (
            <div className="rounded-sm overflow-hidden">
              <img src={snapshot.photoUrl} alt="" className="w-full max-h-[50vh] object-cover" />
            </div>
          ) : (
            <div className="h-32 bg-primary/5 rounded-sm flex items-center justify-center">
              <Scale className="w-10 h-10 text-primary/40" aria-hidden="true" />
            </div>
          )}

          {/* Weight */}
          <div className="flex items-baseline justify-between px-1">
            <span className="font-label text-micro uppercase tracking-widest text-on-surface-variant">
              {p.weight ?? 'Peso'}
            </span>
            <span className="font-headline font-black text-title text-tertiary">
              {displayKg !== null ? `${displayKg} ${unit}` : '—'}
            </span>
          </div>

          {/* Measurements */}
          {hasMeasurements && (
            <div className="bg-surface-container rounded-sm p-3 space-y-2">
              <span className="font-label text-micro uppercase tracking-widest text-on-surface-variant block">
                {p.measurements ?? 'Medidas'}
              </span>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                {m.chestCm != null && (
                  <div className="flex justify-between text-caption">
                    <span className="text-on-surface-variant">{p.chest ?? 'Pecho'}</span>
                    <span className="font-bold text-tertiary">{m.chestCm} cm</span>
                  </div>
                )}
                {m.waistCm != null && (
                  <div className="flex justify-between text-caption">
                    <span className="text-on-surface-variant">{p.waist ?? 'Cintura'}</span>
                    <span className="font-bold text-tertiary">{m.waistCm} cm</span>
                  </div>
                )}
                {m.hipsCm != null && (
                  <div className="flex justify-between text-caption">
                    <span className="text-on-surface-variant">{p.hips ?? 'Caderas'}</span>
                    <span className="font-bold text-tertiary">{m.hipsCm} cm</span>
                  </div>
                )}
                {m.bodyFatPct != null && (
                  <div className="flex justify-between text-caption">
                    <span className="text-on-surface-variant">{p.bodyFat ?? 'Grasa'}</span>
                    <span className="font-bold text-primary">{m.bodyFatPct}%</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Note */}
          {snapshot.note && (
            <div className="bg-surface-container rounded-sm p-3">
              <span className="font-label text-micro uppercase tracking-widest text-on-surface-variant block mb-1">
                {p.note ?? 'Nota'}
              </span>
              <p className="text-xs text-tertiary italic">{snapshot.note}</p>
            </div>
          )}

          {/* Photo indicator for no photo case */}
          {!snapshot.photoUrl && (
            <p className="text-micro text-on-surface-variant/60 text-center flex items-center justify-center gap-1">
              <Camera className="w-3 h-3" aria-hidden="true" />
              {p.noPhotoThisDay ?? 'Sin foto este día'}
            </p>
          )}
        </div>
      </BottomSheet>

      {/* Edit modal — opens on top, closes back to detail */}
      <LogSnapshotModal
        open={editOpen}
        onOpenChange={v => {
          setEditOpen(v);
          if (!v) onOpenChange(false); // close detail too after edit
        }}
        unitSystem={unitSystem}
        initialSnapshot={snapshot}
      />
    </>
  );
}
