import { useRef, useState } from 'react';
import { Camera, ImagePlus, Loader2, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { cn } from '../../../lib/utils';
import { useI18n } from '../../../i18n';
import { isNative, pickImage, triggerHaptic } from '../../../lib/platform';
import { compressImage, RECIPE_PHOTO_OPTIONS } from '../../../lib/imageCompress';

export interface PhotoUploaderProps {
  photos: string[];
  onChange: (next: string[]) => void;
  max?: number;
  className?: string;
}

const MAX_FILE_BYTES = 10 * 1024 * 1024;

/**
 * Multi-photo uploader for recipes. Renders a 3-col grid with thumbnails
 * + an "add" card while `photos.length < max`. First photo is flagged as
 * cover. On native (Capacitor) opens an action-sheet with Camera/Gallery.
 * On web falls back to `<input type="file" multiple>`.
 *
 * Raw File → `compressImage()` @ 1200px / 0.82 before persisting, so a
 * 4 MB camera shot ends up ~150–300 KB as a data URL.
 */
export default function PhotoUploader({
  photos,
  onChange,
  max = 6,
  className,
}: PhotoUploaderProps) {
  const { t } = useI18n();
  const labels = t.createRecipe;
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const canAdd = photos.length < max;
  const maxSizeMB = Math.round(MAX_FILE_BYTES / 1024 / 1024);

  const pushDataUrl = (dataUrl: string) => {
    onChange([...photos, dataUrl]);
  };

  const processFile = async (file: File) => {
    if (file.size > MAX_FILE_BYTES) {
      toast.error(labels.photoTooLarge.replace('{max}', String(maxSizeMB)));
      return;
    }
    try {
      setBusy(true);
      const compressed = await compressImage(
        file,
        RECIPE_PHOTO_OPTIONS.maxWidth,
        RECIPE_PHOTO_OPTIONS.quality,
      );
      pushDataUrl(compressed);
    } catch {
      toast.error(labels.photoError);
    } finally {
      setBusy(false);
    }
  };

  const handleWebFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const slots = max - photos.length;
    const toProcess = Array.from(files).slice(0, slots);
    for (const file of toProcess) {
      await processFile(file);
    }
  };

  const handleNativePick = async (source: 'camera' | 'gallery') => {
    setSheetOpen(false);
    await triggerHaptic('light');
    const dataUrl = await pickImage(source);
    if (!dataUrl) return;
    try {
      setBusy(true);
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], `recipe-${Date.now()}.jpg`, { type: 'image/jpeg' });
      await processFile(file);
    } catch {
      toast.error(labels.photoError);
    } finally {
      setBusy(false);
    }
  };

  const handleAddClick = () => {
    if (isNative) {
      setSheetOpen(true);
      return;
    }
    fileInputRef.current?.click();
  };

  const removeAt = (index: number) => {
    onChange(photos.filter((_, i) => i !== index));
  };

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <span className="font-label text-caption font-bold tracking-widest uppercase text-on-surface-variant">
          {labels.photosSectionLabel}
        </span>
        <span className="font-label text-caption text-on-surface-variant/60">
          {labels.photosCount
            .replace('{count}', String(photos.length))
            .replace('{max}', String(max))}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {photos.map((src, i) => (
          <div
            key={`${src.slice(0, 24)}-${i}`}
            className="relative aspect-square rounded-sm overflow-hidden bg-surface-container-low border border-outline-variant/30"
          >
            <img
              src={src}
              alt=""
              className="w-full h-full object-cover"
              loading="lazy"
              referrerPolicy="no-referrer"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
            />
            {i === 0 && (
              <span className="absolute bottom-1 left-1 bg-neutral-950/70 text-white text-micro font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-sm">
                {labels.coverBadge}
              </span>
            )}
            <button
              type="button"
              onClick={() => removeAt(i)}
              aria-label={labels.removePhoto}
              className="absolute top-1 right-1 min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <span className="flex items-center justify-center w-7 h-7 bg-neutral-950/70 text-white rounded-full hover:bg-neutral-950/90 transition-colors">
                <X className="w-4 h-4" aria-hidden="true" />
              </span>
            </button>
          </div>
        ))}

        {canAdd && (
          <button
            type="button"
            onClick={handleAddClick}
            disabled={busy}
            aria-label={labels.addPhoto}
            className="aspect-square rounded-sm bg-surface-container-low border-2 border-dashed border-outline-variant/30 flex flex-col items-center justify-center gap-1 text-on-surface-variant hover:border-primary/50 hover:text-primary transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {busy ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                <span className="font-label text-micro font-bold uppercase tracking-widest">
                  {labels.compressingPhoto}
                </span>
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" aria-hidden="true" />
                <span className="font-label text-micro font-bold uppercase tracking-widest">
                  {labels.addPhoto}
                </span>
              </>
            )}
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={e => {
          void handleWebFiles(e.target.files);
          e.target.value = '';
        }}
      />

      <Dialog open={sheetOpen} onOpenChange={setSheetOpen}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader>
            <DialogTitle>{labels.addPhoto}</DialogTitle>
            <DialogDescription>{labels.pickSourceHint}</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => handleNativePick('camera')}
              className="flex items-center gap-3 p-4 rounded-sm bg-surface-container-low hover:bg-surface-container transition-colors min-h-[44px]"
            >
              <Camera className="w-5 h-5 text-primary" aria-hidden="true" />
              <span className="font-body text-body">{labels.pickFromCamera}</span>
            </button>
            <button
              type="button"
              onClick={() => handleNativePick('gallery')}
              className="flex items-center gap-3 p-4 rounded-sm bg-surface-container-low hover:bg-surface-container transition-colors min-h-[44px]"
            >
              <ImagePlus className="w-5 h-5 text-primary" aria-hidden="true" />
              <span className="font-body text-body">{labels.pickFromGallery}</span>
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
