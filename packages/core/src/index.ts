/**
 * @rial/core — pure business logic, zero React deps.
 *
 * This package consolidates utilities that are framework-agnostic:
 *   - Media: image compression
 *   - (Future Sprint G.2+) nutrition, daily-quality, activity calories,
 *     widget visibility, ingredient parsing, etc.
 *
 * Consumed by:
 *   - apps/app (React SPA)
 *   - apps/web (Astro/Next future)
 *   - apps/mobile (Expo future)
 *   - services/api (Edge functions can run pure logic)
 *
 * Import patterns:
 *   import { compressImage } from '@rial/core/media/compress';
 *   import { compressImage } from '@rial/core';  // via re-export below
 */

// Media utilities
export {
  compressImage,
  compressRecipePhoto,
  estimateBase64Bytes,
  RECIPE_PHOTO_OPTIONS,
  type CompressOptions,
} from './media/compress';
