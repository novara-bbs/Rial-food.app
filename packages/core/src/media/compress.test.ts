import { describe, it, expect } from 'vitest';
import { estimateBase64Bytes, RECIPE_PHOTO_OPTIONS } from './compress';

describe('imageCompress', () => {
  describe('RECIPE_PHOTO_OPTIONS', () => {
    it('uses 1200px max width for recipe photos', () => {
      expect(RECIPE_PHOTO_OPTIONS.maxWidth).toBe(1200);
    });

    it('uses 0.82 JPEG quality for recipe photos', () => {
      expect(RECIPE_PHOTO_OPTIONS.quality).toBe(0.82);
    });
  });

  describe('estimateBase64Bytes', () => {
    it('computes raw bytes from a data URL', () => {
      // "AAAA" base64 decodes to 3 bytes
      const dataUrl = 'data:image/jpeg;base64,AAAA';
      expect(estimateBase64Bytes(dataUrl)).toBe(3);
    });

    it('accounts for single-character padding', () => {
      // "AAA=" decodes to 2 bytes
      const dataUrl = 'data:image/jpeg;base64,AAA=';
      expect(estimateBase64Bytes(dataUrl)).toBe(2);
    });

    it('accounts for double-character padding', () => {
      // "AA==" decodes to 1 byte
      const dataUrl = 'data:image/jpeg;base64,AA==';
      expect(estimateBase64Bytes(dataUrl)).toBe(1);
    });

    it('handles raw base64 string without the data URL prefix', () => {
      expect(estimateBase64Bytes('AAAA')).toBe(3);
    });

    it('returns a realistic estimate for a ~200 KB thumbnail', () => {
      const payload = 'A'.repeat(266_667);
      const dataUrl = `data:image/jpeg;base64,${payload}`;
      const bytes = estimateBase64Bytes(dataUrl);
      expect(bytes).toBeGreaterThan(199_000);
      expect(bytes).toBeLessThan(201_000);
    });
  });
});
