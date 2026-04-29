import type { Palette } from '../contexts/ThemeContext';

export interface PaletteSwatchColors {
  primary: string;
  bg: string;
  surface: string;
  text: string;
  textMuted: string;
}

export interface PaletteSwatchData {
  dark: PaletteSwatchColors;
  light: PaletteSwatchColors;
}

export const PALETTE_SWATCH_COLORS: Record<Palette, PaletteSwatchData> = {
  neutral: {
    dark:  { primary: '#fafafa', bg: '#0a0a0b', surface: '#18181b', text: '#fafafa', textMuted: '#a1a1aa' },
    light: { primary: '#09090b', bg: '#fafaf9', surface: '#ffffff', text: '#09090b', textMuted: '#44403c' },
  },
  volt: {
    dark:  { primary: '#dcfd05', bg: '#09090b', surface: '#18181b', text: '#fafafa', textMuted: '#a1a1aa' },
    light: { primary: '#65a30d', bg: '#faf9f6', surface: '#ffffff', text: '#09090b', textMuted: '#4a4945' },
  },
  ocean: {
    dark:  { primary: '#38bdf8', bg: '#020617', surface: '#0f172a', text: '#f8fafc', textMuted: '#94a3b8' },
    light: { primary: '#0284c7', bg: '#f8fafc', surface: '#ffffff', text: '#0f172a', textMuted: '#1e293b' },
  },
  ember: {
    dark:  { primary: '#fdac6c', bg: '#0c0a09', surface: '#1c1917', text: '#fafaf9', textMuted: '#a8a29e' },
    light: { primary: '#ea580c', bg: '#fafaf9', surface: '#ffffff', text: '#1c1917', textMuted: '#292524' },
  },
};
