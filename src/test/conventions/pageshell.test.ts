/**
 * PageShell mandatory for screens — ADR-012.
 *
 * Every `.tsx` file under `src/features/*\/screens/` must import `PageShell`
 * from `@/components/PageShell` — the canonical full-screen container that
 * owns padding, safe-area inset, max-width, and scroll ownership. Dropping
 * the shell is how screens silently drift on mobile (edge-to-edge text,
 * wrong scroll container, status-bar clash).
 *
 * Exceptions are explicit in `PAGESHELL_EXCEPTIONS`:
 * - auth screens compose a centered hero without the shell (ADR-012 open item)
 * - viewer/chat full-bleed surfaces (AICoach, StoryViewer, RecipeDetail)
 * - legacy screens pending refactor (Explore, Planner) — flagged for review
 *
 * Complements the ESLint `preferHeadingPrimitive` rule (ADR-012) which
 * handles the heading side of the screen contract.
 */
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const SCREENS_ROOT = path.resolve(process.cwd(), 'src/features');

/**
 * Documented exceptions. Each entry is a path relative to repo root and
 * MUST stay small — growth here is a design-system regression. Auth is
 * permanent (ADR-012); the others are migration targets.
 *
 * When a file is migrated to PageShell, remove it from this list.
 */
const PAGESHELL_EXCEPTIONS = new Set<string>([
  // Permanent (ADR-012 §Open items — centered editorial composition).
  'src/features/auth/screens/ForgotPassword.tsx',
  'src/features/auth/screens/Login.tsx',
  'src/features/auth/screens/Signup.tsx',
  // Full-bleed surfaces (hero image / chat / viewer) — documented exceptions.
  'src/features/ai/screens/AICoach.tsx',
  'src/features/recipes/screens/RecipeDetail.tsx',
  'src/features/social/screens/StoryViewer.tsx',
  // Legacy screens pending audit — remove when migrated.
  'src/features/home/screens/Explore.tsx',
  'src/features/planner/screens/Planner.tsx',
]);

function walkScreens(dir: string, out: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkScreens(full, out);
    else if (
      /\.tsx$/.test(entry.name) &&
      full.split(path.sep).includes('screens')
    ) {
      out.push(full);
    }
  }
  return out;
}

const screens = walkScreens(SCREENS_ROOT)
  .map((f) => f.split(path.sep).join('/'))
  .map((f) => f.replace(process.cwd().split(path.sep).join('/') + '/', ''))
  .sort();

describe('PageShell mandatory for feature screens (ADR-012)', () => {
  it('discovers all screens under src/features/*/screens/', () => {
    expect(screens.length).toBeGreaterThan(30);
  });

  for (const rel of screens) {
    it(`${rel} imports PageShell or is a documented exception`, () => {
      const abs = path.resolve(process.cwd(), rel);
      const src = fs.readFileSync(abs, 'utf8');
      const usesShell =
        /from\s+['"]@\/components\/PageShell['"]/.test(src) ||
        /<PageShell[\s>]/.test(src);
      const isException = PAGESHELL_EXCEPTIONS.has(rel);
      if (!usesShell && !isException) {
        throw new Error(
          `${rel} does not import PageShell and is not in PAGESHELL_EXCEPTIONS. ` +
            `Wrap the screen with <PageShell> from @/components/PageShell or add an ` +
            `explicit exception in src/test/conventions/pageshell.test.ts with a reason.`,
        );
      }
      expect(usesShell || isException).toBe(true);
    });
  }

  it('exception list stays small (≤ 10 files)', () => {
    expect(PAGESHELL_EXCEPTIONS.size).toBeLessThanOrEqual(10);
  });

  it('every exception still exists on disk', () => {
    for (const rel of PAGESHELL_EXCEPTIONS) {
      const abs = path.resolve(process.cwd(), rel);
      expect(fs.existsSync(abs), `Exception ${rel} references a missing file`).toBe(true);
    }
  });
});
