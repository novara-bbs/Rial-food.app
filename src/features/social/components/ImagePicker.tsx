import { Camera, Image as ImageIcon, X } from 'lucide-react';
import { useRef } from 'react';
import { compressImage } from '../utils/image-utils';

interface ImagePickerProps {
  image: string | null;
  onImageChange: (base64: string | null) => void;
}

export default function ImagePicker({ image, onImageChange }: ImagePickerProps) {
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    const compressed = await compressImage(file, 800, 0.6);
    onImageChange(compressed);
  };

  if (image) {
    return (
      <div className="relative rounded-sm overflow-hidden border border-outline-variant/20">
        <img src={image} alt="Preview" className="w-full max-h-64 object-cover" />
        <button
          onClick={() => onImageChange(null)}
          className="absolute top-2 right-2 w-7 h-7 bg-surface-container-highest/90 rounded-full flex items-center justify-center text-on-surface-variant hover:text-error transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
      <input ref={galleryRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
      <button
        onClick={() => cameraRef.current?.click()}
        className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-colors"
        aria-label="Camera"
      >
        <Camera className="w-5 h-5" />
      </button>
      <button
        onClick={() => galleryRef.current?.click()}
        className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant hover:text-brand-secondary hover:bg-brand-secondary/10 transition-colors"
        aria-label="Gallery"
      >
        <ImageIcon className="w-5 h-5" />
      </button>
    </div>
  );
}
