import type { BodySnapshot } from '../../../types/wellness';
import type { CommunityPost, ProgressPostPayload } from '../../../types/social';

interface ShareProgressDeps {
  setCommunityPosts: (fn: (prev: CommunityPost[]) => CommunityPost[]) => void;
}

interface ShareProgressOptions {
  /** Snapshot being shared. */
  snapshot: BodySnapshot;
  /** Reference snapshot used to compute delta. */
  referenceSnapshot?: BodySnapshot;
  /** User-written caption. Hashtags are extracted automatically. */
  content: string;
  /** `milestone` = auto-prompt; `snapshot` = user-initiated share. */
  kind?: ProgressPostPayload['kind'];
  /** Author identity (defaults to `self`). */
  author?: { id?: string; name?: string; img?: string; role?: string };
}

/**
 * Factory for the "share my progress to community" handler.
 * Creates a CommunityPost of type `progress` and prepends it to the feed.
 * Delta + reference date are computed and stored on the post payload so the
 * ProgressPostCard renderer doesn't need live access to weightHistory.
 */
export function createHandleShareProgress(deps: ShareProgressDeps) {
  return ({
    snapshot,
    referenceSnapshot,
    content,
    kind = 'snapshot',
    author,
  }: ShareProgressOptions): CommunityPost => {
    const deltaKg = referenceSnapshot
      ? +(snapshot.kg - referenceSnapshot.kg).toFixed(1)
      : undefined;

    const progress: ProgressPostPayload = {
      kind,
      currentKg: snapshot.kg,
      deltaKg,
      sinceDate: referenceSnapshot?.date,
      photoUrl: snapshot.photoUrl,
    };

    // Fallback name is English-neutral so an i18n-agnostic default never leaks
    // ES into EN feeds. Callers should pass `author.name` from `userProfile.name`.
    // `time` is left empty — consumers should derive the display label from
    // `createdAt` via `formatRelative()` in `lib/dates` + the matching i18n key.
    const post: CommunityPost = {
      id: Date.now(),
      author: {
        id: author?.id ?? 'self',
        name: author?.name ?? 'You',
        img: author?.img ?? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
        role: author?.role ?? 'Member',
        time: '',
      },
      content,
      images: [],
      type: 'progress',
      progress,
      hashtags: extractHashtags(content),
      likes: 0,
      comments: 0,
      saves: 0,
      commentsList: [],
      createdAt: new Date().toISOString(),
    };

    deps.setCommunityPosts(prev => [post, ...prev]);
    return post;
  };
}

function extractHashtags(text: string): string[] {
  const matches = text.match(/#(\w+)/g);
  if (!matches) return [];
  return matches.map(m => m.slice(1));
}
