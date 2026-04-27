/**
 * BarcodeScanner — compatibility shim.
 *
 * The implementation has been promoted to the `food/barcode` sub-feature
 * (Phase 3.3, ADR-015). This file keeps all existing import sites working
 * without change.
 *
 * New code should import directly from:
 *   `@/features/food/barcode/screens/BarcodeScannerScreen`
 */
export { default } from '../barcode/screens/BarcodeScannerScreen';
export type { ScannedProduct } from '../utils/pseudo-ingredient';
