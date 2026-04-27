/**
 * Pure utility helpers shared across the CreateRecipe wizard sections.
 * No React imports — safe to use in both component and test contexts.
 */

/** Swap two items in an array, returning a new array without mutation. */
export function swapped<T>(arr: T[], idx: number, dir: -1 | 1): T[] {
  const tgt = idx + dir;
  if (tgt < 0 || tgt >= arr.length) return arr;
  const next = [...arr];
  [next[idx], next[tgt]] = [next[tgt], next[idx]];
  return next;
}

/** Detect time references like "15 minutos" or "1h" inside a step text. */
export function detectTimers(text: string): number[] {
  const pattern = /(\d+)\s*(min(?:uto)?s?|h(?:ora)?s?)/gi;
  const times: number[] = [];
  let match;
  while ((match = pattern.exec(text)) !== null) {
    const v = parseInt(match[1]);
    times.push(match[2].toLowerCase().startsWith('h') ? v * 60 : v);
  }
  return times;
}

/**
 * Centre-crop an image file to a 16:9 aspect ratio and return a JPEG data URL.
 * Output width is capped at 1280px to keep the data URL small.
 */
export function cropTo16x9(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      const TARGET_RATIO = 16 / 9;
      const srcW = img.naturalWidth;
      const srcH = img.naturalHeight;
      const srcRatio = srcW / srcH;

      let sx = 0, sy = 0, sw = srcW, sh = srcH;
      if (srcRatio > TARGET_RATIO) {
        sw = Math.round(srcH * TARGET_RATIO);
        sx = Math.round((srcW - sw) / 2);
      } else if (srcRatio < TARGET_RATIO) {
        sh = Math.round(srcW / TARGET_RATIO);
        sy = Math.round((srcH - sh) / 2);
      }

      const MAX_W = 1280;
      const outW = Math.min(sw, MAX_W);
      const outH = Math.round(outW / TARGET_RATIO);

      const canvas = document.createElement('canvas');
      canvas.width = outW;
      canvas.height = outH;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('no 2d context'));
        return;
      }
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, outW, outH);
      URL.revokeObjectURL(objectUrl);
      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('image load failed'));
    };
    img.src = objectUrl;
  });
}
