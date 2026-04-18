import { useState, useEffect, useRef } from 'react';
import { Camera, Image as ImageIcon, ChevronDown, ChevronUp, X, Check } from 'lucide-react';
import BottomSheet from '@/components/ui/bottom-sheet';
import { useI18n } from '../../../i18n';
import { useAppState } from '../../../contexts/AppStateContext';
import { bodyWeightFromKg, bodyWeightToKg, getBodyWeightUnit, type UnitSystem } from '../../food/utils/units';
import { compressImage, estimateStorageUsage } from '../../social/utils/image-utils';
import type { BodySnapshot, BodyMeasurements } from '../../../types/wellness';
import { toast } from 'sonner';
import { todayLocal } from '../../../lib/dates';

interface LogSnapshotModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  unitSystem: UnitSystem;
  /** If editing an existing snapshot, pre-fill the form. */
  initialSnapshot?: BodySnapshot;
  /** Optional — pre-fill a specific date (used when clicking an empty calendar day). */
  initialDate?: string;
}

export default function LogSnapshotModal({
  open,
  onOpenChange,
  unitSystem,
  initialSnapshot,
  initialDate,
}: LogSnapshotModalProps) {
  const { t } = useI18n();
  const { handleLogWeight } = useAppState();
  const unit = getBodyWeightUnit(unitSystem);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const today = todayLocal();
  const [date, setDate] = useState(today);
  const [weightInput, setWeightInput] = useState('');
  const [note, setNote] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(undefined);
  const [measurements, setMeasurements] = useState<BodyMeasurements>({});
  const [photoExpanded, setPhotoExpanded] = useState(false);
  const [measureExpanded, setMeasureExpanded] = useState(false);

  // Reset form when opening
  useEffect(() => {
    if (!open) return;
    if (initialSnapshot) {
      setDate(initialSnapshot.date);
      setWeightInput(initialSnapshot.kg > 0 ? String(bodyWeightFromKg(initialSnapshot.kg, unitSystem)) : '');
      setNote(initialSnapshot.note ?? '');
      setPhotoUrl(initialSnapshot.photoUrl);
      setMeasurements(initialSnapshot.measurements ?? {});
      setPhotoExpanded(!!initialSnapshot.photoUrl);
      setMeasureExpanded(
        !!initialSnapshot.measurements && Object.values(initialSnapshot.measurements).some(v => v != null),
      );
    } else {
      setDate(initialDate ?? today);
      setWeightInput('');
      setNote('');
      setPhotoUrl(undefined);
      setMeasurements({});
      setPhotoExpanded(false);
      setMeasureExpanded(false);
    }
  }, [open, initialSnapshot?.date, initialDate]);

  const handlePhotoUpload = async (file: File | undefined) => {
    if (!file) return;
    const { usedMB } = estimateStorageUsage();
    if (usedMB > 4) {
      toast.warning(t.progress?.storageWarning ?? 'Storage almost full');
      return;
    }
    const base64 = await compressImage(file, 800, 0.7);
    setPhotoUrl(base64);
  };

  const handleSave = () => {
    const val = parseFloat(weightInput);
    if (isNaN(val)) {
      toast.error(t.progress?.weightRequired ?? 'El peso es obligatorio');
      return;
    }
    const kg = bodyWeightToKg(val, unitSystem);
    if (kg < 20 || kg > 300) {
      toast.error(t.progress?.weightOutOfRange ?? 'Peso fuera de rango (20–300 kg)');
      return;
    }
    const cleanMeasurements = Object.fromEntries(
      Object.entries(measurements).filter(([, v]) => v != null && !isNaN(v as number)),
    ) as BodyMeasurements;
    const hasMeasure = Object.keys(cleanMeasurements).length > 0;
    const { replaced } = handleLogWeight({
      kg,
      date,
      note: note.trim() || undefined,
      photoUrl: photoUrl || undefined,
      measurements: hasMeasure ? cleanMeasurements : undefined,
    });
    if (replaced) toast.info(t.progress?.weightReplaced ?? 'Peso actualizado para hoy');
    onOpenChange(false);
  };

  const p = t.progress;
  const title = initialSnapshot ? (p.editSnapshot ?? 'Editar snapshot') : (p.logSnapshot ?? 'Registrar snapshot');

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      footer={
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="flex-1 min-h-11 py-2.5 text-caption font-bold uppercase tracking-widest text-on-surface-variant hover:text-tertiary border border-outline-variant/30 rounded-sm transition-colors"
          >
            {p.cancel ?? 'Cancelar'}
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 min-h-11 py-2.5 text-caption font-bold uppercase tracking-widest bg-primary text-on-primary rounded-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" aria-hidden="true" />
            {p.save ?? 'Guardar'}
          </button>
        </div>
      }
    >
      <div className="space-y-4 py-2">
        {/* Date */}
        <div>
          <label className="block font-label text-micro tracking-widest uppercase text-on-surface-variant mb-1.5">
            {p.snapshotDate ?? 'Fecha'}
          </label>
          <input
            type="date"
            value={date}
            max={today}
            onChange={e => setDate(e.target.value)}
            disabled={!!initialSnapshot}
            className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-sm py-2 px-3 text-body-sm text-tertiary focus:outline-none focus:border-primary disabled:opacity-60"
          />
        </div>

        {/* Weight */}
        <div>
          <label className="block font-label text-micro tracking-widest uppercase text-on-surface-variant mb-1.5">
            {p.weight ?? 'Peso'} ({unit}) *
          </label>
          <input
            type="number" step="0.1" inputMode="decimal" min="20" max="300"
            value={weightInput}
            onChange={e => setWeightInput(e.target.value)}
            placeholder="72.5"
            autoFocus={!initialSnapshot}
            className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-sm py-2 px-3 text-body-sm text-tertiary focus:outline-none focus:border-primary"
          />
        </div>

        {/* Photo (collapsible) */}
        <div>
          <button
            type="button"
            onClick={() => setPhotoExpanded(v => !v)}
            className="w-full flex items-center justify-between py-1.5 border-b border-outline-variant/10"
          >
            <span className="font-label text-micro tracking-widest uppercase text-on-surface-variant flex items-center gap-2">
              <Camera className="w-3 h-3" aria-hidden="true" />
              {p.photoOptional ?? 'Foto (opcional)'}
              {photoUrl && <span className="text-primary">●</span>}
            </span>
            {photoExpanded ? <ChevronUp className="w-3 h-3 text-on-surface-variant" /> : <ChevronDown className="w-3 h-3 text-on-surface-variant" />}
          </button>
          {photoExpanded && (
            <div className="pt-3 animate-in fade-in slide-in-from-top-2">
              {photoUrl ? (
                <div className="relative rounded-sm overflow-hidden">
                  <img src={photoUrl} alt="" className="w-full max-h-48 object-cover" />
                  <button
                    type="button"
                    onClick={() => setPhotoUrl(undefined)}
                    className="absolute top-2 right-2 w-11 h-11 bg-surface-container-highest/90 rounded-full flex items-center justify-center text-on-surface-variant hover:text-error transition-colors"
                    aria-label={p.removePhoto ?? 'Eliminar foto'}
                  >
                    <X className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input ref={photoInputRef} type="file" accept="image/*" capture="environment" className="hidden"
                    onChange={e => handlePhotoUpload(e.target.files?.[0])} />
                  <button type="button" onClick={() => photoInputRef.current?.click()}
                    className="flex-1 min-h-11 flex items-center justify-center gap-1.5 bg-primary/10 text-primary py-2 rounded-sm text-micro font-bold uppercase tracking-widest hover:bg-primary/20 transition-colors">
                    <Camera className="w-3.5 h-3.5" aria-hidden="true" />
                    {p.takePhoto ?? 'Cámara'}
                  </button>
                  <input ref={galleryInputRef} type="file" accept="image/*" className="hidden"
                    onChange={e => handlePhotoUpload(e.target.files?.[0])} />
                  <button type="button" onClick={() => galleryInputRef.current?.click()}
                    className="flex-1 min-h-11 flex items-center justify-center gap-1.5 bg-surface-container-highest text-on-surface-variant py-2 rounded-sm text-micro font-bold uppercase tracking-widest hover:text-tertiary transition-colors">
                    <ImageIcon className="w-3.5 h-3.5" aria-hidden="true" />
                    {p.choosePhoto ?? 'Galería'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Measurements (collapsible) */}
        <div>
          <button
            type="button"
            onClick={() => setMeasureExpanded(v => !v)}
            className="w-full flex items-center justify-between py-1.5 border-b border-outline-variant/10"
          >
            <span className="font-label text-micro tracking-widest uppercase text-on-surface-variant">
              {p.measurementsOptional ?? 'Medidas (opcional)'}
              {Object.values(measurements).some(v => v != null) && <span className="text-primary ml-1">●</span>}
            </span>
            {measureExpanded ? <ChevronUp className="w-3 h-3 text-on-surface-variant" /> : <ChevronDown className="w-3 h-3 text-on-surface-variant" />}
          </button>
          {measureExpanded && (
            <div className="pt-3 grid grid-cols-2 gap-2.5 animate-in fade-in slide-in-from-top-2">
              {([
                { key: 'chestCm', label: p.chest ?? 'Pecho' },
                { key: 'waistCm', label: p.waist ?? 'Cintura' },
                { key: 'hipsCm', label: p.hips ?? 'Caderas' },
                { key: 'bodyFatPct', label: p.bodyFat ?? 'Grasa %' },
              ] as { key: keyof BodyMeasurements; label: string }[]).map(({ key, label }) => (
                <div key={key}>
                  <label className="block font-label text-micro uppercase tracking-widest text-on-surface-variant mb-1">{label}</label>
                  <input
                    type="number" step="0.1" inputMode="decimal"
                    value={measurements[key] ?? ''}
                    onChange={e => setMeasurements(prev => ({
                      ...prev,
                      [key]: e.target.value ? parseFloat(e.target.value) : undefined,
                    }))}
                    className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-sm py-1.5 px-2.5 text-body-sm text-tertiary focus:outline-none focus:border-primary"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Note */}
        <div>
          <label className="block font-label text-micro tracking-widest uppercase text-on-surface-variant mb-1.5">
            {p.noteOptional ?? 'Nota (opcional)'}
          </label>
          <input
            type="text" value={note} maxLength={100}
            onChange={e => setNote(e.target.value)}
            placeholder={p.weightNotePlaceholder ?? 'Ej. después de entrenar'}
            className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-sm py-2 px-3 text-body-sm text-tertiary focus:outline-none focus:border-primary"
          />
        </div>
      </div>
    </BottomSheet>
  );
}
