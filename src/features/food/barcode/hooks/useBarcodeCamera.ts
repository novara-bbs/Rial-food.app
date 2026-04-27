/**
 * useBarcodeCamera — camera lifecycle for the barcode scanner.
 *
 * Manages the html5-qrcode instance: boot on mount, teardown on unmount,
 * and restart via the returned `startScanner` callback.
 *
 * Extracted from BarcodeScanner.tsx (Phase 3.3, ADR-015).
 */
import { useRef, useCallback, useEffect, useState } from 'react';
import { useI18n } from '@/i18n';
import { logger } from '@/lib/logger';

interface UseBarcoreCameraReturn {
  /** Attach to the `<div id="barcode-reader">` element. */
  scannerRef: React.RefObject<HTMLDivElement | null>;
  /** Re-start the camera (call after `handleScanAnother`). */
  startScanner: () => Promise<void>;
  /** Stop the camera (called automatically on unmount). */
  stopScanner: () => void;
  /** 'scanning' once Html5Qrcode is running; 'idle' otherwise. */
  cameraStatus: 'idle' | 'scanning';
  /** Non-empty when camera permission is denied or not available. */
  cameraErrorMsg: string;
}

/**
 * @param onBarcodeDetected Called once per successful scan with the raw
 *   decoded string. The hook stops the scanner immediately so the caller
 *   receives exactly one barcode per session.
 */
export function useBarcodeCamera(
  onBarcodeDetected: (barcode: string) => void,
): UseBarcoreCameraReturn {
  const { t } = useI18n();
  const scannerRef = useRef<HTMLDivElement | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const html5QrRef = useRef<any>(null);

  // Keep the callback stable via ref so startScanner (memoized with [])
  // always calls the latest version without needing it as a dep.
  const onBarcodeRef = useRef(onBarcodeDetected);
  useEffect(() => { onBarcodeRef.current = onBarcodeDetected; });

  const [cameraStatus, setCameraStatus] = useState<'idle' | 'scanning'>('idle');
  const [cameraErrorMsg, setCameraErrorMsg] = useState('');

  const stopScanner = useCallback(() => {
    if (html5QrRef.current) {
      html5QrRef.current.stop().catch(() => {});
      html5QrRef.current = null;
    }
  }, []);

  const startScanner = useCallback(async () => {
    setCameraErrorMsg('');
    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      if (!scannerRef.current) return;
      const scanner = new Html5Qrcode('barcode-reader');
      html5QrRef.current = scanner;
      setCameraStatus('scanning');
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 120 }, aspectRatio: 1.5 },
        (decodedText: string) => {
          scanner.stop().catch(() => {});
          onBarcodeRef.current(decodedText);
        },
        () => {}, // verbose frame-level callback — intentionally silent
      );
    } catch (err) {
      logger.warn('Camera not available', {
        error: err instanceof Error ? err.message : String(err),
      });
      setCameraStatus('idle');
      setCameraErrorMsg(t.scanner.cameraNotAvailable);
    }
    // No deps: stable via refs. Camera boots exactly once per mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Boot camera on mount; clean up on unmount.
  useEffect(() => {
    startScanner();
    return stopScanner;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { scannerRef, startScanner, stopScanner, cameraStatus, cameraErrorMsg };
}
