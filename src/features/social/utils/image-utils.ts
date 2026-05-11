// Sprint G [1.6.0]: compressImage migrated to @rial/core/media/compress.
// Kept as re-export for backward compatibility with legacy callers in social/.
export { compressImage } from '@rial/core/media/compress';

export function estimateStorageUsage(): { usedMB: number; limitMB: number } {
  let total = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      total += (localStorage.getItem(key)?.length || 0) * 2;
    }
  }
  return { usedMB: Math.round((total / 1024 / 1024) * 100) / 100, limitMB: 5 };
}
