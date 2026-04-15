import {
  TrendingUp, TrendingDown, Scale, Flame, BarChart3, Calendar,
  Plus, Check, Camera, Image as ImageIcon, Ruler, X,
} from 'lucide-react';
import PageShell from '../../../components/PageShell';
import { useState, useMemo, useRef } from 'react';
import { useI18n } from '../../../i18n';
import { useAppState } from '../../../contexts/AppStateContext';
import { getLoggingStreak, type DailyArchive } from '../../../hooks/useDailyReset';
import { calcVitality } from '../../home/utils/homeWidgets';
import PageHeader from '../../../components/patterns/PageHeader';
import { bodyWeightFromKg, bodyWeightToKg, getBodyWeightUnit } from '../../food/utils/units';
import type { BodySnapshot, BodyMeasurements } from '../../../types/wellness';
import { compressImage, estimateStorageUsage } from '../../social/utils/image-utils';
import { toast } from 'sonner';

// ─── Tab types ───────────────────────────────────────────────────────────────
type ProgressTab = 'weight' | 'photos' | 'measurements' | 'nutrition';

// ─── Measurements delta helper ───────────────────────────────────────────────
function measurementDelta(
  latest: BodyMeasurements | undefined,
  baseline: BodyMeasurements | undefined,
  key: keyof BodyMeasurements,
): number | null {
  const a = latest?.[key];
  const b = baseline?.[key];
  if (a == null || b == null) return null;
  return +(a - b).toFixed(1);
}

export default function Progress({ onBack }: { onBack: () => void }) {
  const { t } = useI18n();
  const {
    nutritionHistory, weightHistory, dailyMacros, dailyLog,
    realFeelLogs, mealPlan, userProfile,
    handleLogWeight, handleUpdateSnapshot,
  } = useAppState();
  const unitSystem = userProfile?.unitSystem ?? 'metric';
  const weightUnit = getBodyWeightUnit(unitSystem);

  // ─── Tab state ──────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<ProgressTab>('weight');

  // ─── Weight log state ────────────────────────────────────────────────────────
  const [isEditingWeight, setIsEditingWeight] = useState(false);
  const [weightInput, setWeightInput] = useState('');
  const [weightNote, setWeightNote] = useState('');

  // ─── Measurements form state ─────────────────────────────────────────────────
  const [measureForm, setMeasureForm] = useState<BodyMeasurements>({});
  const [isMeasureEditing, setIsMeasureEditing] = useState(false);

  // ─── Photo upload refs ───────────────────────────────────────────────────────
  const photoInputRef = useRef<HTMLInputElement>(null);

  const history = nutritionHistory as DailyArchive[];
  const snapshots = weightHistory as BodySnapshot[];
  const streak = getLoggingStreak(history);
  const todayStreak = dailyLog.length > 0 ? streak.current + 1 : streak.current;

  // ─── Weight log submit ────────────────────────────────────────────────────────
  const handleLogWeightSubmit = () => {
    const val = parseFloat(weightInput);
    if (isNaN(val)) return;
    const kg = bodyWeightToKg(val, unitSystem);
    if (kg < 20 || kg > 300) return;
    handleLogWeight({ kg, note: weightNote.trim() || undefined });
    setIsEditingWeight(false);
    setWeightInput('');
    setWeightNote('');
  };

  // ─── Photo upload ─────────────────────────────────────────────────────────────
  const handlePhotoUpload = async (file: File | undefined, date: string) => {
    if (!file) return;
    const { usedMB } = estimateStorageUsage();
    if (usedMB > 4) {
      toast.warning(t.progress?.storageWarning ?? 'Casi sin espacio de almacenamiento. Elimina fotos antiguas.');
      return;
    }
    const base64 = await compressImage(file, 800, 0.7);
    handleUpdateSnapshot({ date, photoUrl: base64 });
  };

  // ─── Dashboard Widgets ────────────────────────────────────────────────────────
  const dashboardWidgets = useMemo(() => {
    const { avgVitality, trend: vitalityTrend, entryCount: recent7Count } = calcVitality(realFeelLogs || []);
    const planValues: any[] = mealPlan ? Object.values(mealPlan) : [];
    const totalPlannedWeek: number = planValues.reduce((sum: number, meals: any) => sum + (Array.isArray(meals) ? meals.length : 0), 0);
    return { avgVitality, vitalityTrend, recent7Count, totalPlannedWeek };
  }, [realFeelLogs, mealPlan]);

  // ─── Weight Trend ─────────────────────────────────────────────────────────────
  const sortedWeights = [...snapshots].sort((a, b) => a.date.localeCompare(b.date));
  const last30Weights = sortedWeights.slice(-30);
  const currentWeight = sortedWeights.length > 0 ? sortedWeights[sortedWeights.length - 1].kg : null;
  const firstWeight = sortedWeights.length > 0 ? sortedWeights[0].kg : null;

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 86_400_000).toISOString().slice(0, 10);
  const recentWeights = sortedWeights.filter(w => w.date >= weekAgo);
  const weekDelta = recentWeights.length >= 2
    ? recentWeights[recentWeights.length - 1].kg - recentWeights[0].kg
    : null;

  const chartWidth = 300;
  const chartHeight = 120;
  const chartPadding = 10;
  let weightPath = '';
  if (last30Weights.length >= 2) {
    const minKg = Math.min(...last30Weights.map(w => w.kg)) - 0.5;
    const maxKg = Math.max(...last30Weights.map(w => w.kg)) + 0.5;
    const range = maxKg - minKg || 1;
    const points = last30Weights.map((w, i) => {
      const x = chartPadding + (i / (last30Weights.length - 1)) * (chartWidth - 2 * chartPadding);
      const y = chartPadding + (1 - (w.kg - minKg) / range) * (chartHeight - 2 * chartPadding);
      return `${x},${y}`;
    });
    weightPath = `M${points.join(' L')}`;
  }

  // ─── Nutrition Summary ────────────────────────────────────────────────────────
  const thisWeekStart = new Date(now.getTime() - now.getDay() * 86_400_000).toISOString().slice(0, 10);
  const lastWeekStart = new Date(new Date(thisWeekStart).getTime() - 7 * 86_400_000).toISOString().slice(0, 10);
  const thisWeekDays = history.filter(h => h.date >= thisWeekStart);
  const lastWeekDays = history.filter(h => h.date >= lastWeekStart && h.date < thisWeekStart);
  const avg = (entries: DailyArchive[], key: 'cal' | 'pro' | 'carbs' | 'fats') => {
    if (entries.length === 0) return 0;
    return Math.round(entries.reduce((s, e) => s + (e.macros.consumed[key] || 0), 0) / entries.length);
  };
  const thisWeekAvg = { cal: avg(thisWeekDays, 'cal'), pro: avg(thisWeekDays, 'pro'), carbs: avg(thisWeekDays, 'carbs'), fats: avg(thisWeekDays, 'fats') };
  const lastWeekAvg = { cal: avg(lastWeekDays, 'cal'), pro: avg(lastWeekDays, 'pro'), carbs: avg(lastWeekDays, 'carbs'), fats: avg(lastWeekDays, 'fats') };
  const proteinTarget = dailyMacros.target?.pro || 180;
  const proteinHitDays = thisWeekDays.filter(h => h.macros.consumed.pro >= proteinTarget).length;

  // ─── Consistency calendar ─────────────────────────────────────────────────────
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getDay();
  const loggedDates = new Set(history.filter(h => h.mealCount > 0).map(h => h.date));
  if (dailyLog.length > 0) loggedDates.add(now.toISOString().slice(0, 10));
  const photoDates = new Set(snapshots.filter(s => s.photoUrl).map(s => s.date));

  // ─── Target Weight ────────────────────────────────────────────────────────────
  const targetKg = userProfile?.targetWeight ?? null;
  const targetProgressPct: number | null =
    targetKg && currentWeight && firstWeight && firstWeight !== targetKg
      ? Math.min(100, Math.max(0, Math.round(
          Math.abs(currentWeight - firstWeight) / Math.abs(targetKg - firstWeight) * 100,
        )))
      : null;
  const targetDisplay = targetKg ? `${bodyWeightFromKg(targetKg, unitSystem)} ${weightUnit}` : null;

  // ─── Photo timeline (newest first, only snapshots with photos) ────────────────
  const photoSnapshots = [...snapshots]
    .filter(s => s.photoUrl)
    .sort((a, b) => b.date.localeCompare(a.date));

  // ─── Measurements (latest + baseline for delta) ──────────────────────────────
  const snapshotsWithMeasure = [...snapshots]
    .filter(s => s.measurements && Object.keys(s.measurements).length > 0)
    .sort((a, b) => b.date.localeCompare(a.date));
  const latestMeasure = snapshotsWithMeasure[0];
  const baselineMeasure = snapshotsWithMeasure[snapshotsWithMeasure.length - 1];
  const today = now.toISOString().slice(0, 10);

  const p = t.progress;

  const TAB_LABELS: Record<ProgressTab, string> = {
    weight: p.tabWeight ?? 'Peso',
    photos: p.tabPhotos ?? 'Fotos',
    measurements: p.tabMeasurements ?? 'Medidas',
    nutrition: p.tabNutrition ?? 'Nutrición',
  };

  return (
    <PageShell maxWidth="narrow" spacing="lg">
      <PageHeader onBack={onBack} label="" title={p.title || 'Tu Progreso'} />

      {/* ─── Dashboard Widgets ─── */}
      <section className="grid grid-cols-3 gap-3">
        <div className="bg-surface-container-low border border-outline-variant/20 rounded-sm p-3 flex flex-col gap-1">
          <span className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant">Real Score</span>
          <div className="flex items-center gap-1">
            <span className="font-headline font-black text-xl text-primary">{dashboardWidgets.avgVitality}</span>
            {dashboardWidgets.vitalityTrend === 'up' && <TrendingUp className="w-3.5 h-3.5 text-brand-secondary" />}
            {dashboardWidgets.vitalityTrend === 'down' && <TrendingDown className="w-3.5 h-3.5 text-error" />}
          </div>
          <span className="text-[9px] text-on-surface-variant">{dashboardWidgets.recent7Count} {p.entries}</span>
        </div>
        <div className="bg-surface-container-low border border-outline-variant/20 rounded-sm p-3 flex flex-col gap-1">
          <span className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant">Plan</span>
          <span className="font-headline font-black text-xl text-brand-secondary">{dashboardWidgets.totalPlannedWeek}</span>
          <span className="text-[9px] text-on-surface-variant">{p.thisWeek || 'esta semana'}</span>
        </div>
        <div className="bg-surface-container-low border border-outline-variant/20 rounded-sm p-3 flex flex-col gap-1">
          <span className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant">{p.currentStreak || 'Racha actual'}</span>
          <div className="flex items-center gap-1">
            <Flame className="w-4 h-4 text-brand-secondary" />
            <span className="font-headline font-black text-xl text-tertiary">{todayStreak}</span>
          </div>
          <span className="text-[9px] text-on-surface-variant">{p.days || 'días'}</span>
        </div>
      </section>

      {/* ─── Tab Bar ─── */}
      <div className="flex bg-surface-container rounded-sm p-1 gap-1">
        {(Object.keys(TAB_LABELS) as ProgressTab[]).map(tab => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 text-[9px] font-bold uppercase tracking-widest rounded-sm transition-all ${
              activeTab === tab
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-on-surface-variant hover:text-tertiary'
            }`}
          >
            {TAB_LABELS[tab]}
          </button>
        ))}
      </div>

      {/* ══════════════ WEIGHT TAB ══════════════ */}
      {activeTab === 'weight' && (
        <>
          <section className="bg-surface-container-low border border-outline-variant/20 rounded-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-headline font-bold text-sm uppercase tracking-widest text-tertiary flex items-center gap-2">
                <Scale className="w-4 h-4 text-primary" /> {p.weightTrend || 'Tendencia de Peso'}
              </h2>
              {weekDelta !== null && (
                <div className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest ${weekDelta > 0 ? 'text-brand-secondary' : weekDelta < 0 ? 'text-primary' : 'text-on-surface-variant'}`}>
                  {weekDelta > 0 ? <TrendingUp className="w-3.5 h-3.5" /> : weekDelta < 0 ? <TrendingDown className="w-3.5 h-3.5" /> : null}
                  {weekDelta > 0 ? '+' : ''}{bodyWeightFromKg(Math.abs(weekDelta), unitSystem).toFixed(1)} {weightUnit} {p.thisWeek || 'esta semana'}
                </div>
              )}
            </div>

            {last30Weights.length >= 2 ? (
              <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-32">
                <path d={weightPath} fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                {last30Weights.map((w, i) => {
                  const minKg = Math.min(...last30Weights.map(w2 => w2.kg)) - 0.5;
                  const maxKg = Math.max(...last30Weights.map(w2 => w2.kg)) + 0.5;
                  const range = maxKg - minKg || 1;
                  const x = chartPadding + (i / (last30Weights.length - 1)) * (chartWidth - 2 * chartPadding);
                  const y = chartPadding + (1 - (w.kg - minKg) / range) * (chartHeight - 2 * chartPadding);
                  return <circle key={w.date} cx={x} cy={y} r="3" fill="var(--primary)" />;
                })}
              </svg>
            ) : (
              <div className="h-32 flex items-center justify-center text-on-surface-variant text-xs font-label uppercase tracking-widest">
                {p.noWeightData || 'Registra tu peso para ver la tendencia'}
              </div>
            )}

            <div className="grid grid-cols-3 gap-4 pt-2 border-t border-outline-variant/10">
              <div className="text-center">
                <span className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant block">{p.current || 'Actual'}</span>
                <span className="font-headline font-black text-lg text-tertiary">{currentWeight ? `${bodyWeightFromKg(currentWeight, unitSystem)} ${weightUnit}` : '—'}</span>
              </div>
              <div className="text-center">
                <span className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant block">{p.start || 'Inicio'}</span>
                <span className="font-headline font-black text-lg text-on-surface-variant">{firstWeight ? `${bodyWeightFromKg(firstWeight, unitSystem)} ${weightUnit}` : '—'}</span>
              </div>
              <div className="text-center">
                <span className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant block">{p.change || 'Cambio'}</span>
                <span className={`font-headline font-black text-lg ${currentWeight && firstWeight ? (currentWeight - firstWeight > 0 ? 'text-brand-secondary' : 'text-primary') : 'text-on-surface-variant'}`}>
                  {currentWeight && firstWeight ? `${(currentWeight - firstWeight) > 0 ? '+' : ''}${bodyWeightFromKg(Math.abs(currentWeight - firstWeight), unitSystem).toFixed(1)} ${weightUnit}` : '—'}
                </span>
              </div>
            </div>

            {targetProgressPct !== null && targetDisplay && (
              <div className="pt-3 border-t border-outline-variant/10 space-y-1.5 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant">
                    {p.targetProgress || 'Progreso hacia objetivo'}
                  </span>
                  <span className="font-label text-[9px] font-bold text-primary uppercase tracking-widest">
                    {targetDisplay} · {targetProgressPct}%
                  </span>
                </div>
                <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${targetProgressPct}%` }} />
                </div>
              </div>
            )}

            {sortedWeights.length > 0 && (
              <div className="pt-3 border-t border-outline-variant/10 space-y-1">
                <span className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant">{p.recentEntries || 'Últimas entradas'}</span>
                {[...sortedWeights].reverse().slice(0, 5).map(entry => (
                  <div key={entry.date} className="flex items-start justify-between gap-3 py-1">
                    <div className="flex items-center gap-2 shrink-0">
                      {entry.photoUrl && <Camera className="w-3 h-3 text-primary/60" aria-hidden="true" />}
                      <span className="font-label text-[10px] text-on-surface-variant">
                        {new Date(entry.date + 'T12:00:00').toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0 text-right">
                      <span className="font-headline font-bold text-xs text-tertiary">
                        {entry.kg > 0 ? `${bodyWeightFromKg(entry.kg, unitSystem)} ${weightUnit}` : '—'}
                      </span>
                      {entry.note && <p className="text-[9px] text-on-surface-variant/70 mt-0.5 truncate">{entry.note}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {isEditingWeight ? (
              <div className="pt-3 border-t border-outline-variant/10 space-y-2 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center gap-2">
                  <input
                    type="number" inputMode="decimal" step="0.1" min="20" max="300"
                    value={weightInput}
                    onChange={e => setWeightInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleLogWeightSubmit()}
                    className="flex-1 bg-surface-container-highest border border-outline-variant/20 rounded-sm py-2 px-3 text-sm text-tertiary placeholder:text-on-surface-variant focus:outline-none focus:border-primary transition-colors"
                    placeholder={currentWeight ? String(bodyWeightFromKg(currentWeight, unitSystem)) : '72.5'}
                    autoFocus
                  />
                  <span className="text-sm font-bold text-on-surface-variant">{weightUnit}</span>
                  <button type="button" onClick={handleLogWeightSubmit} aria-label={p.logWeight}
                    className="w-9 h-9 flex items-center justify-center rounded-full bg-primary text-on-primary hover:opacity-90 transition-opacity">
                    <Check className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
                <input type="text" value={weightNote} onChange={e => setWeightNote(e.target.value)} maxLength={100}
                  className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-sm py-2 px-3 text-xs text-tertiary placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary transition-colors"
                  placeholder={p.weightNotePlaceholder || 'Nota opcional'} />
              </div>
            ) : (
              <button type="button"
                onClick={() => { setIsEditingWeight(true); setWeightInput(currentWeight ? String(bodyWeightFromKg(currentWeight, unitSystem)) : ''); }}
                className="w-full pt-3 border-t border-outline-variant/10 text-center text-[10px] font-bold text-primary uppercase tracking-widest hover:underline flex items-center justify-center gap-1.5">
                <Plus className="w-3.5 h-3.5" /> {p.logWeight}
              </button>
            )}
          </section>
        </>
      )}

      {/* ══════════════ PHOTOS TAB ══════════════ */}
      {activeTab === 'photos' && (
        <section className="space-y-4">
          {/* Add photo for today */}
          <div className="bg-surface-container-low border border-outline-variant/20 rounded-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-headline font-bold text-sm uppercase tracking-widest text-tertiary flex items-center gap-2">
                <Camera className="w-4 h-4 text-primary" /> {p.addPhoto ?? 'Añadir foto'}
              </h2>
              <span className="font-label text-[9px] text-on-surface-variant uppercase tracking-widest">
                {new Date(today + 'T12:00:00').toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>

            {/* Today's photo preview or picker */}
            {(() => {
              const todaySnap = snapshots.find(s => s.date === today);
              if (todaySnap?.photoUrl) {
                return (
                  <div className="relative rounded-sm overflow-hidden">
                    <img src={todaySnap.photoUrl} alt="Today" className="w-full max-h-64 object-cover rounded-sm" />
                    <button type="button"
                      onClick={() => handleUpdateSnapshot({ date: today, photoUrl: '' })}
                      className="absolute top-2 right-2 w-7 h-7 bg-surface-container-highest/90 rounded-full flex items-center justify-center text-on-surface-variant hover:text-error transition-colors"
                      aria-label={p.removePhoto ?? 'Eliminar foto'}>
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                );
              }
              return (
                <div className="flex gap-3">
                  <input ref={photoInputRef} type="file" accept="image/*" capture="environment" className="hidden"
                    onChange={e => handlePhotoUpload(e.target.files?.[0], today)} />
                  <button type="button" onClick={() => photoInputRef.current?.click()}
                    className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-primary/20 transition-colors">
                    <Camera className="w-3.5 h-3.5" aria-hidden="true" />
                    {p.takePhoto ?? 'Tomar foto'}
                  </button>
                  <label className="flex items-center gap-2 bg-surface-container-highest text-on-surface-variant px-4 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest hover:text-tertiary transition-colors cursor-pointer">
                    <ImageIcon className="w-3.5 h-3.5" aria-hidden="true" />
                    {p.choosePhoto ?? 'Galería'}
                    <input type="file" accept="image/*" className="hidden"
                      onChange={e => handlePhotoUpload(e.target.files?.[0], today)} />
                  </label>
                </div>
              );
            })()}
          </div>

          {/* Photo timeline */}
          {photoSnapshots.length > 0 ? (
            <div className="space-y-4">
              <h3 className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant px-1">
                {p.photoHistory ?? 'Historial de fotos'} · {photoSnapshots.length}
              </h3>
              {photoSnapshots.map(snap => (
                <div key={snap.date} className="bg-surface-container-low border border-outline-variant/20 rounded-sm overflow-hidden">
                  <img src={snap.photoUrl} alt={snap.date} className="w-full max-h-80 object-cover" />
                  <div className="p-3 flex items-center justify-between">
                    <div>
                      <span className="font-label text-[10px] text-on-surface-variant">
                        {new Date(snap.date + 'T12:00:00').toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                      {snap.kg > 0 && (
                        <span className="ml-2 font-headline font-bold text-xs text-tertiary">
                          {bodyWeightFromKg(snap.kg, unitSystem)} {weightUnit}
                        </span>
                      )}
                      {snap.note && <p className="text-[9px] text-on-surface-variant/70 mt-0.5">{snap.note}</p>}
                    </div>
                    <button type="button"
                      onClick={() => handleUpdateSnapshot({ date: snap.date, photoUrl: '' })}
                      className="w-7 h-7 bg-surface-container-highest rounded-full flex items-center justify-center text-on-surface-variant hover:text-error transition-colors"
                      aria-label={p.removePhoto ?? 'Eliminar foto'}>
                      <X className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-surface-container-low border border-outline-variant/20 border-dashed rounded-sm p-10 flex flex-col items-center gap-3 text-center">
              <Camera className="w-8 h-8 text-on-surface-variant/40" />
              <p className="font-headline font-bold text-sm text-tertiary uppercase tracking-widest">
                {p.noPhotosTitle ?? 'Sin fotos aún'}
              </p>
              <p className="text-xs text-on-surface-variant max-w-[200px]">
                {p.noPhotosDesc ?? 'Registra tu progreso visual y mira cómo cambia tu cuerpo con el tiempo.'}
              </p>
            </div>
          )}
        </section>
      )}

      {/* ══════════════ MEASUREMENTS TAB ══════════════ */}
      {activeTab === 'measurements' && (
        <section className="space-y-4">
          {/* Entry form */}
          <div className="bg-surface-container-low border border-outline-variant/20 rounded-sm p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-headline font-bold text-sm uppercase tracking-widest text-tertiary flex items-center gap-2">
                <Ruler className="w-4 h-4 text-primary" /> {p.measurements ?? 'Medidas'}
              </h2>
              <button type="button"
                onClick={() => {
                  if (isMeasureEditing) {
                    // Save
                    const hasValues = Object.values(measureForm).some(v => v != null && !isNaN(v as number));
                    if (hasValues) handleUpdateSnapshot({ date: today, measurements: measureForm });
                    setIsMeasureEditing(false);
                    setMeasureForm({});
                  } else {
                    const todayMeasure = snapshots.find(s => s.date === today)?.measurements ?? {};
                    setMeasureForm(todayMeasure);
                    setIsMeasureEditing(true);
                  }
                }}
                className="text-[10px] font-bold uppercase tracking-widest text-primary hover:underline flex items-center gap-1">
                {isMeasureEditing ? <><Check className="w-3 h-3" /> {p.save ?? 'Guardar'}</> : <><Plus className="w-3 h-3" /> {p.addMeasurement ?? 'Añadir'}</>}
              </button>
            </div>

            {isMeasureEditing && (
              <div className="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-2">
                {([
                  { key: 'chestCm', label: p.chest ?? 'Pecho (cm)' },
                  { key: 'waistCm', label: p.waist ?? 'Cintura (cm)' },
                  { key: 'hipsCm', label: p.hips ?? 'Caderas (cm)' },
                  { key: 'bodyFatPct', label: p.bodyFat ?? 'Grasa corporal (%)' },
                ] as { key: keyof BodyMeasurements; label: string }[]).map(({ key, label }) => (
                  <div key={key}>
                    <label className="block font-label text-[9px] uppercase tracking-widest text-on-surface-variant mb-1">{label}</label>
                    <input
                      type="number" step="0.1" inputMode="decimal"
                      value={measureForm[key] ?? ''}
                      onChange={e => setMeasureForm(prev => ({
                        ...prev,
                        [key]: e.target.value ? parseFloat(e.target.value) : undefined,
                      }))}
                      className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-sm py-1.5 px-2.5 text-sm text-tertiary focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Delta table — latest vs baseline */}
          {latestMeasure && baselineMeasure && latestMeasure.date !== baselineMeasure.date ? (
            <div className="bg-surface-container-low border border-outline-variant/20 rounded-sm p-5 space-y-3">
              <h3 className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant">
                {p.measurementProgress ?? 'Evolución'}
              </h3>
              <div className="grid grid-cols-3 text-center gap-2">
                <span className="font-label text-[8px] uppercase tracking-widest text-on-surface-variant">{p.measurementField ?? 'Medida'}</span>
                <span className="font-label text-[8px] uppercase tracking-widest text-on-surface-variant">{p.measurementLatest ?? 'Actual'}</span>
                <span className="font-label text-[8px] uppercase tracking-widest text-on-surface-variant">{p.measurementDelta ?? 'Cambio'}</span>
              </div>
              {([
                { key: 'chestCm', label: p.chest ?? 'Pecho' },
                { key: 'waistCm', label: p.waist ?? 'Cintura' },
                { key: 'hipsCm', label: p.hips ?? 'Caderas' },
                { key: 'bodyFatPct', label: p.bodyFat ?? 'Grasa %' },
              ] as { key: keyof BodyMeasurements; label: string }[]).map(({ key, label }) => {
                const latestVal = latestMeasure.measurements?.[key];
                const delta = measurementDelta(latestMeasure.measurements, baselineMeasure.measurements, key);
                if (latestVal == null) return null;
                const unit = key === 'bodyFatPct' ? '%' : 'cm';
                return (
                  <div key={key} className="grid grid-cols-3 text-center gap-2 py-1.5 border-t border-outline-variant/10">
                    <span className="font-label text-[10px] text-on-surface-variant">{label}</span>
                    <span className="font-headline font-bold text-xs text-tertiary">{latestVal} {unit}</span>
                    {delta !== null ? (
                      <span className={`font-headline font-bold text-xs ${delta < 0 ? 'text-primary' : delta > 0 ? 'text-brand-secondary' : 'text-on-surface-variant'}`}>
                        {delta > 0 ? '+' : ''}{delta} {unit}
                      </span>
                    ) : <span className="text-on-surface-variant">—</span>}
                  </div>
                );
              })}
              <p className="text-[8px] text-on-surface-variant/60 text-right">
                {p.measurementBaseDate ?? 'Base'}:{' '}
                {new Date(baselineMeasure.date + 'T12:00:00').toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
              </p>
            </div>
          ) : snapshotsWithMeasure.length === 0 ? (
            <div className="bg-surface-container-low border border-outline-variant/20 border-dashed rounded-sm p-10 flex flex-col items-center gap-3 text-center">
              <Ruler className="w-8 h-8 text-on-surface-variant/40" />
              <p className="font-headline font-bold text-sm text-tertiary uppercase tracking-widest">
                {p.noMeasurementsTitle ?? 'Sin medidas aún'}
              </p>
              <p className="text-xs text-on-surface-variant max-w-[200px]">
                {p.noMeasurementsDesc ?? 'Registra tus medidas corporales para ver tu evolución.'}
              </p>
            </div>
          ) : null}

          {/* History list */}
          {snapshotsWithMeasure.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant px-1">
                {p.measurementHistory ?? 'Historial'} · {snapshotsWithMeasure.length}
              </h3>
              {snapshotsWithMeasure.slice(0, 8).map(snap => (
                <div key={snap.date} className="bg-surface-container-low border border-outline-variant/20 rounded-sm px-4 py-3 flex items-center justify-between gap-3">
                  <span className="font-label text-[10px] text-on-surface-variant shrink-0">
                    {new Date(snap.date + 'T12:00:00').toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                  </span>
                  <div className="flex-1 flex flex-wrap gap-x-3 gap-y-0.5 justify-end">
                    {snap.measurements?.waistCm && <span className="text-[10px] text-tertiary font-bold">C {snap.measurements.waistCm}cm</span>}
                    {snap.measurements?.hipsCm && <span className="text-[10px] text-tertiary font-bold">Ca {snap.measurements.hipsCm}cm</span>}
                    {snap.measurements?.chestCm && <span className="text-[10px] text-tertiary font-bold">P {snap.measurements.chestCm}cm</span>}
                    {snap.measurements?.bodyFatPct && <span className="text-[10px] text-primary font-bold">{snap.measurements.bodyFatPct}%</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ══════════════ NUTRITION TAB ══════════════ */}
      {activeTab === 'nutrition' && (
        <>
          <section className="bg-surface-container-low border border-outline-variant/20 rounded-sm p-6 space-y-4">
            <h2 className="font-headline font-bold text-sm uppercase tracking-widest text-tertiary flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-brand-secondary" /> {p.nutritionSummary || 'Resumen Nutricional'}
            </h2>

            {thisWeekDays.length > 0 ? (
              <>
                <div className="grid grid-cols-4 gap-3">
                  {(['cal', 'pro', 'carbs', 'fats'] as const).map(key => {
                    const labels: Record<string, string> = { cal: 'kcal', pro: 'Prot', carbs: 'Carbs', fats: 'Grasas' };
                    const thisVal = thisWeekAvg[key];
                    const lastVal = lastWeekAvg[key];
                    const delta = lastVal > 0 ? Math.round(((thisVal - lastVal) / lastVal) * 100) : 0;
                    return (
                      <div key={key} className="text-center bg-surface-container rounded-sm p-3">
                        <span className="font-label text-[8px] uppercase tracking-widest text-on-surface-variant block mb-1">{labels[key]}</span>
                        <span className="font-headline font-black text-lg text-tertiary block">{thisVal}</span>
                        {lastVal > 0 && (
                          <span className={`text-[9px] font-bold ${delta > 0 ? 'text-brand-secondary' : delta < 0 ? 'text-primary' : 'text-on-surface-variant'}`}>
                            {delta > 0 ? '+' : ''}{delta}%
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-outline-variant/10">
                  <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">{p.proteinTarget || 'Objetivo de proteína'}</span>
                  <span className="font-headline font-bold text-sm text-primary">{proteinHitDays}/{thisWeekDays.length} {p.days || 'días'}</span>
                </div>
              </>
            ) : (
              <div className="h-24 flex items-center justify-center text-on-surface-variant text-xs font-label uppercase tracking-widest">
                {p.noNutritionData || 'Sin datos de esta semana'}
              </div>
            )}
          </section>

          <section className="bg-surface-container-low border border-outline-variant/20 rounded-sm p-6 space-y-4">
            <h2 className="font-headline font-bold text-sm uppercase tracking-widest text-tertiary flex items-center gap-2">
              <Flame className="w-4 h-4 text-brand-secondary" /> {p.consistency || 'Consistencia'}
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-surface-container rounded-sm p-4 text-center">
                <span className="font-headline font-black text-3xl text-primary">{todayStreak}</span>
                <span className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant block mt-1">{p.currentStreak || 'Racha actual'}</span>
              </div>
              <div className="bg-surface-container rounded-sm p-4 text-center">
                <span className="font-headline font-black text-3xl text-on-surface-variant">{streak.best}</span>
                <span className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant block mt-1">{p.bestStreak || 'Mejor racha'}</span>
              </div>
            </div>

            {/* Calendar with photo overlay */}
            <div className="pt-3 border-t border-outline-variant/10">
              <div className="flex items-center justify-between mb-3">
                <span className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {now.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                </span>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <div className="w-2.5 h-2.5 rounded-sm bg-primary" />
                    <span className="text-[8px] text-on-surface-variant">{p.logged || 'Registrado'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Camera className="w-2.5 h-2.5 text-primary/60" aria-hidden="true" />
                    <span className="text-[8px] text-on-surface-variant">{p.hasPhoto ?? 'Foto'}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1.5">
                {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(d => (
                  <span key={d} className="text-center text-[8px] font-bold text-on-surface-variant uppercase">{d}</span>
                ))}
                {Array.from({ length: (firstDayOfMonth + 6) % 7 }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  const isToday = dateStr === now.toISOString().slice(0, 10);
                  const isLogged = loggedDates.has(dateStr);
                  const hasPhoto = photoDates.has(dateStr);
                  const isFuture = day > now.getDate();
                  return (
                    <div key={day} className="relative aspect-square">
                      <div className={`w-full h-full rounded-sm flex items-center justify-center text-[9px] font-bold ${
                        isFuture
                          ? 'bg-surface-container/50 text-on-surface-variant/30'
                          : isLogged
                            ? 'bg-primary text-on-primary'
                            : 'bg-surface-container-highest text-on-surface-variant/50'
                      } ${isToday ? 'ring-1 ring-primary ring-offset-1 ring-offset-surface-container-low' : ''}`}>
                        {day}
                      </div>
                      {hasPhoto && !isFuture && (
                        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-primary/60 rounded-full border border-surface-container-low" aria-label="foto" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </>
      )}
    </PageShell>
  );
}
