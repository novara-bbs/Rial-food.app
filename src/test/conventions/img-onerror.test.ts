/**
 * Static lock — every NEW `<img src=` in feature/pattern files must either:
 *   (a) declare an `onError` handler on the same JSX element, OR
 *   (b) come from the canonical `<RecipeImage>` primitive (which encapsulates
 *       the onError + ChefHat fallback pattern).
 *
 * Sprint [1.5.175]. Without this guard, a rotted CDN URL renders an empty
 * box with no signal — visually broken and not actionable.
 *
 * The pre-1.5.175 offender baseline is allowlisted below to keep the sprint
 * surgical; future sprints (Cocina/Recipes/Social/Wellness polish) will pick
 * those up. Adding new files to the baseline is FORBIDDEN — fix the JSX
 * instead. The test fails the build if any allowlisted file no longer
 * contains a raw `<img>` (so the baseline shrinks naturally as files migrate).
 */
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();

/**
 * Pre-1.5.175 baseline of files containing `<img src=` without onError.
 * One entry per relative path. Future migrations should DELETE entries from
 * this list (the test enforces "still has a raw img" so a removed entry
 * means the file was migrated, which is the goal).
 */
const BASELINE_OFFENDERS: ReadonlySet<string> = new Set([
  'src/features/food/components/barcode/BarcodeFoundPanel.tsx',
  'src/features/home/screens/More.tsx',
  'src/features/planner/screens/Planner.tsx',
  'src/features/profile/components/settings/SettingsProfile.tsx',
  'src/features/profile/screens/Profile.tsx',
  'src/features/recipes/components/AuthorAttributionCard.tsx',
  'src/features/recipes/components/CookMode.tsx',
  'src/features/recipes/components/HeroGallery.tsx',
  'src/features/recipes/components/MediaLightbox.tsx',
  'src/features/recipes/components/PhotoUploader.tsx',
  'src/features/recipes/components/VideoSection.tsx',
  'src/features/recipes/components/create/CreateRecipeStep3Instructions.tsx',
  'src/features/recipes/components/create/CreateRecipeStep4Review.tsx',
  'src/features/recipes/components/detail/RecipeOverviewTab.tsx',
  'src/features/recipes/screens/RecipeDetail.tsx',
  'src/features/social/components/AvatarRing.tsx',
  'src/features/social/components/ImagePicker.tsx',
  'src/features/social/components/PostCard.tsx',
  'src/features/social/components/ProgressPostCard.tsx',
  'src/features/social/components/PublishRecipeSheet.tsx',
  'src/features/social/components/RecipePicker.tsx',
  'src/features/social/screens/ChallengeDetail.tsx',
  'src/features/social/screens/CreatePost.tsx',
  'src/features/social/screens/CreateStory.tsx',
  'src/features/social/screens/CreatorProfile.tsx',
  'src/features/social/screens/Discover.tsx',
  'src/features/social/screens/Notifications.tsx',
  'src/features/social/screens/PostDetail.tsx',
  'src/features/social/screens/StoryViewer.tsx',
  'src/features/wellness/components/BeforeAfterCompare.tsx',
  'src/features/wellness/components/BodyCalendar.tsx',
  'src/features/wellness/components/BodySnapshotCard.tsx',
  'src/features/wellness/components/LogSnapshotModal.tsx',
  'src/features/wellness/components/SnapshotDetailModal.tsx',
]);

function listFiles(dir: string, exts: string[]): string[] {
  const out: string[] = [];
  const walk = (d: string) => {
    if (!fs.existsSync(d)) return;
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (exts.some(e => entry.name.endsWith(e))) out.push(full);
    }
  };
  walk(dir);
  return out;
}

function fileHasRawImgWithoutOnError(absPath: string): boolean {
  const src = fs.readFileSync(absPath, 'utf8');
  // Match opening <img ...> tag (could span lines via [\s\S]).
  const regex = /<img\b[\s\S]*?>/g;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(src)) !== null) {
    const tag = m[0];
    if (!tag.includes('src=')) continue;
    if (tag.includes('onError')) continue;
    return true;
  }
  return false;
}

describe('Convention — every NEW <img> in features/patterns has onError fallback', () => {
  const featureFiles = listFiles(path.resolve(ROOT, 'src/features'), ['.tsx']);
  const patternFiles = listFiles(path.resolve(ROOT, 'src/components/patterns'), ['.tsx']);
  const allFiles = [...featureFiles, ...patternFiles].filter(
    f => !f.endsWith('.test.tsx') && !f.endsWith('.spec.tsx'),
  );

  it('no new files contain <img src=> without onError (baseline-locked)', () => {
    const newOffenders: string[] = [];
    for (const file of allFiles) {
      const rel = path.relative(ROOT, file).replace(/\\/g, '/');
      if (BASELINE_OFFENDERS.has(rel)) continue;
      if (fileHasRawImgWithoutOnError(file)) newOffenders.push(rel);
    }
    if (newOffenders.length > 0) {
      throw new Error(
        `New <img src=> without onError detected. Migrate to <RecipeImage> or add onError. New offenders:\n${newOffenders.join('\n')}`,
      );
    }
    expect(newOffenders).toEqual([]);
  });

  it('baseline does not contain stale entries (every allowlisted file still has a raw <img>)', () => {
    const stale: string[] = [];
    for (const rel of BASELINE_OFFENDERS) {
      const abs = path.resolve(ROOT, rel);
      if (!fs.existsSync(abs)) {
        stale.push(`${rel} (file no longer exists — remove from baseline)`);
        continue;
      }
      if (!fileHasRawImgWithoutOnError(abs)) {
        stale.push(`${rel} (no longer has raw <img> — migrated, remove from baseline)`);
      }
    }
    if (stale.length > 0) {
      throw new Error(
        `Stale baseline entries — remove these from BASELINE_OFFENDERS:\n${stale.join('\n')}`,
      );
    }
    expect(stale).toEqual([]);
  });
});
