export { compressImage } from '../../../lib/imageCompress';

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
