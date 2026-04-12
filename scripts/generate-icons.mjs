/**
 * RIAL Icon Generator
 * Converts public/icons/icon.svg into all required PNG sizes for:
 *  - PWA web manifest (192, 512, maskable-512)
 *  - Apple touch icon (180)
 *  - Favicons (32, 16)
 *  - Capacitor native assets directory (1024 for @capacitor/assets)
 *
 * Usage:
 *   npm run generate-icons
 *
 * Requires:
 *   npm install -D sharp  (already installed)
 *
 * After running this, also run:
 *   npx @capacitor/assets generate --android --ios
 *   (requires resources/icon.png at 1024x1024 — created by this script)
 */
import sharp from 'sharp';
import { readFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SVG_PATH = join(ROOT, 'public', 'icons', 'icon.svg');
const ICONS_DIR = join(ROOT, 'public', 'icons');
const RESOURCES_DIR = join(ROOT, 'resources');

mkdirSync(ICONS_DIR, { recursive: true });
mkdirSync(RESOURCES_DIR, { recursive: true });

const svg = readFileSync(SVG_PATH);

const icons = [
  // PWA manifest icons
  { file: 'icon-192.png',           size: 192,  desc: 'PWA 192×192' },
  { file: 'icon-512.png',           size: 512,  desc: 'PWA 512×512' },
  { file: 'icon-maskable-512.png',  size: 512,  desc: 'PWA maskable 512×512' },
  // Apple
  { file: 'apple-touch-icon-180.png', size: 180, desc: 'Apple touch icon 180×180' },
  // Favicons
  { file: 'favicon-32.png',         size: 32,   desc: 'Favicon 32×32' },
  { file: 'favicon-16.png',         size: 16,   desc: 'Favicon 16×16' },
  // Capacitor source icon (used by @capacitor/assets)
  { file: '../../../resources/icon.png', size: 1024, desc: 'Capacitor master 1024×1024', outDir: RESOURCES_DIR, outFile: 'icon.png' },
];

for (const icon of icons) {
  const outDir = icon.outDir ?? ICONS_DIR;
  const outFile = icon.outFile ?? icon.file;
  const outPath = join(outDir, outFile);

  await sharp(svg)
    .resize(icon.size, icon.size)
    .png()
    .toFile(outPath);

  console.log(`✓ ${icon.desc} → ${outFile}`);
}

console.log('\n✅ All icons generated!');
console.log('Next: npx @capacitor/assets generate --android --ios  (generates native assets)');
