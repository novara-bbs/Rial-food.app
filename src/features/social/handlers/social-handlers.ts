/**
 * Post/comment handlers. i18n-aware: the author name comes from `userProfile`
 * and the "just now" label comes from `t.social.justNow` so EN locale shows
 * "Just now" instead of the literal ES `'Justo ahora'`. `isOwnPost` in
 * Community should match by `author.id === 'self'` rather than by localized
 * display name.
 */
import type { CommunityPost } from '../../../types/social';

// ─── Deps ─────────────────────────────────────────────────────────────────────

type PostSetter = (fn: CommunityPost[] | ((prev: CommunityPost[]) => CommunityPost[])) => void;

interface UserProfileLike {
  name?: string;
  avatar?: string | null;
}

interface SocialT {
  social: { justNow: string; anonymousUser: string; member: string };
}

// ─── createHandleCreatePost ───────────────────────────────────────────────────

export function createHandleCreatePost(deps: {
  setCommunityPosts: PostSetter;
  navigateTo: (screen: string) => void;
  getUserProfile: () => UserProfileLike;
  getT: () => SocialT;
}) {
  return (
    content: string,
    performance?: CommunityPost['performance'],
    options?: { images?: string[]; recipe?: CommunityPost['recipe']; hashtags?: string[] },
  ) => {
    const hashtags = options?.hashtags || extractHashtags(content);
    const profile = deps.getUserProfile();
    const t = deps.getT();
    const name = (profile.name && profile.name.trim()) || t.social.anonymousUser;
    const avatar = profile.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80';

    const newPost: CommunityPost = {
      id: Date.now(),
      author: { id: 'self', name, img: avatar, role: t.social.member, time: t.social.justNow },
      content,
      images: options?.images || [],
      likes: 0,
      comments: 0,
      saves: 0,
      type: options?.recipe ? 'recipe' : performance ? 'performance' : 'text',
      performance,
      recipe: options?.recipe,
      hashtags,
      commentsList: [],
      createdAt: new Date().toISOString(),
    };

    deps.setCommunityPosts((prev: CommunityPost[]) => [newPost, ...prev]);
    deps.navigateTo('explore');
  };
}

// ─── createHandleAddComment ───────────────────────────────────────────────────

export function createHandleAddComment(deps: {
  setCommunityPosts: PostSetter;
  getUserProfile: () => UserProfileLike;
  getT: () => SocialT;
}) {
  return (postId: number, commentText: string) => {
    const profile = deps.getUserProfile();
    const t = deps.getT();
    const author = (profile.name && profile.name.trim()) || t.social.anonymousUser;

    deps.setCommunityPosts((prev: CommunityPost[]) =>
      prev.map((post: CommunityPost) =>
        post.id === postId
          ? {
              ...post,
              comments: post.comments + 1,
              commentsList: [
                ...(post.commentsList || []),
                {
                  id: Date.now(),
                  text: commentText,
                  author,
                  authorId: 'self',
                  time: t.social.justNow,
                  createdAt: new Date().toISOString(),
                },
              ],
            }
          : post
      )
    );
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function extractHashtags(text: string): string[] {
  const matches = text.match(/#(\w+)/g);
  if (!matches) return [];
  return matches.map(m => m.slice(1));
}
