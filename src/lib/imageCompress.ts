export interface CompressOptions {
  maxWidth?: number;
  quality?: number;
}

export const RECIPE_PHOTO_OPTIONS: Required<CompressOptions> = {
  maxWidth: 1200,
  quality: 0.82,
};

export function compressImage(
  file: File,
  maxWidth = 800,
  quality = 0.6,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let w = img.width;
        let h = img.height;
        if (w > maxWidth) {
          h = Math.round((h * maxWidth) / w);
          w = maxWidth;
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas context unavailable'));
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function compressRecipePhoto(file: File): Promise<string> {
  return compressImage(file, RECIPE_PHOTO_OPTIONS.maxWidth, RECIPE_PHOTO_OPTIONS.quality);
}

export function estimateBase64Bytes(dataUrl: string): number {
  const comma = dataUrl.indexOf(',');
  const payload = comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl;
  const padding = payload.endsWith('==') ? 2 : payload.endsWith('=') ? 1 : 0;
  return Math.floor((payload.length * 3) / 4) - padding;
}
