/**
 * Safe-area / notch contract — ADR-016.
 *
 * Locks the foundation pieces that make the app render correctly on iPhones
 * with notch / Dynamic Island and Android phones with display cutouts:
 *
 *   1. `src/index.css` exposes `pt-safe`, `pb-safe`, `pl-safe`, `pr-safe`,
 *      `pb-safe-nav` utilities. Screens never read `env(safe-area-inset-*)`
 *      directly — they always go through these utilities.
 *   2. `<PageShell>` exports a `safeArea` prop (`'top' | 'bottom' | 'both' |
 *      'none'`) so fullscreen routes (auth, AICoach, StoryViewer) can opt
 *      into insets without sprinkling raw env() styles.
 *   3. `<GlobalHeader>` reserves the top inset (`pt-safe`) so the avatar /
 *      streak don't collide with the Dynamic Island on iPhone 14 Pro+.
 *   4. `capacitor.config.ts` declares `overlaysWebView` explicitly on the
 *      StatusBar plugin — eliminates cross-platform ambiguity.
 *   5. `index.html` keeps `viewport-fit=cover` (required for env() to
 *      resolve to non-zero on iOS Safari + Capacitor WKWebView).
 *
 * Static file-read pattern — mirrors `bottom-sheet.test.ts` and
 * `home-hero.test.ts`. No DOM render path.
 */
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();

const INDEX_CSS = fs.readFileSync(
  path.resolve(ROOT, 'src/index.css'),
  'utf8',
);
const PAGE_SHELL_SRC = fs.readFileSync(
  path.resolve(ROOT, 'src/components/PageShell.tsx'),
  'utf8',
);
const GLOBAL_HEADER_SRC = fs.readFileSync(
  path.resolve(ROOT, 'src/components/GlobalHeader.tsx'),
  'utf8',
);
const CAPACITOR_CONFIG = fs.readFileSync(
  path.resolve(ROOT, 'capacitor.config.ts'),
  'utf8',
);
const INDEX_HTML = fs.readFileSync(
  path.resolve(ROOT, 'index.html'),
  'utf8',
);

describe('Safe-area utilities — index.css', () => {
  it('declares pt-safe utility (top inset for headers + fullscreen routes)', () => {
    expect(INDEX_CSS).toMatch(/@utility pt-safe\s*\{[^}]*env\(safe-area-inset-top/);
  });

  it('declares pb-safe utility (bottom inset for edge-to-edge content)', () => {
    expect(INDEX_CSS).toMatch(/@utility pb-safe\s*\{[^}]*env\(safe-area-inset-bottom/);
  });

  it('declares pl-safe + pr-safe utilities (landscape iOS notch on the side)', () => {
    expect(INDEX_CSS).toMatch(/@utility pl-safe\s*\{[^}]*env\(safe-area-inset-left/);
    expect(INDEX_CSS).toMatch(/@utility pr-safe\s*\{[^}]*env\(safe-area-inset-right/);
  });

  it('keeps pb-safe-nav utility (BottomNav home-indicator clearance + breathing room)', () => {
    expect(INDEX_CSS).toMatch(/@utility pb-safe-nav\s*\{[^}]*env\(safe-area-inset-bottom/);
  });
});

describe('PageShell — safeArea prop contract', () => {
  it('exports a safeArea prop with the four canonical values', () => {
    // The prop union: 'none' | 'top' | 'bottom' | 'both'.
    expect(PAGE_SHELL_SRC).toMatch(/safeArea\?:/);
    expect(PAGE_SHELL_SRC).toMatch(/none:\s*'/);
    expect(PAGE_SHELL_SRC).toMatch(/top:\s*'pt-safe'/);
    expect(PAGE_SHELL_SRC).toMatch(/bottom:\s*'pb-safe'/);
    expect(PAGE_SHELL_SRC).toMatch(/both:\s*'pt-safe pb-safe'/);
  });

  it("defaults safeArea to 'none' (preserves prior behavior for screens with chrome)", () => {
    expect(PAGE_SHELL_SRC).toMatch(/safeArea\s*=\s*'none'/);
  });
});

describe('GlobalHeader — top inset compensation', () => {
  it('applies pt-safe so the topbar respects the notch / Dynamic Island', () => {
    expect(GLOBAL_HEADER_SRC).toMatch(/pt-safe/);
  });

  it('preserves 64px (h-16 equivalent) of visible header content via env()-aware height', () => {
    // The contract: header height = inset + 4rem (= 64px content + variable inset).
    // If this changes intentionally, update ADR-016 + this assertion together.
    expect(GLOBAL_HEADER_SRC).toMatch(/h-\[calc\(env\(safe-area-inset-top,\s*0px\)\s*\+\s*4rem\)\]/);
  });

  it('keeps the sticky positioning + z-index (no regression of header chrome)', () => {
    expect(GLOBAL_HEADER_SRC).toMatch(/sticky top-0 z-50/);
  });
});

describe('Capacitor config — StatusBar overlaysWebView declared', () => {
  it('sets overlaysWebView explicitly (no platform-default ambiguity)', () => {
    expect(CAPACITOR_CONFIG).toMatch(/overlaysWebView:\s*(true|false)/);
  });
});

describe('viewport-fit=cover — required for env() insets to resolve', () => {
  it('index.html declares viewport-fit=cover on the meta viewport tag', () => {
    expect(INDEX_HTML).toMatch(/viewport-fit\s*=\s*cover/);
  });
});
