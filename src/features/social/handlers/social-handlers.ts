/**
 * Post/comment handlers. i18n-aware: the author name comes from `userProfile`
 * and the "just now" label comes from `t.social.justNow` so EN locale shows
 * "Just now" instead of the literal ES `'Justo ahora'`. `isOwnPost` in
 * Community should match by `author.id === 'self'` rather than by localized
 * display name.
 */
interface UserProfileLike {
  name?: string;
  avatar?: string | null;
}

interface SocialT {
  social: { justNow: string; anonymousUser: string; member: string };
}

export function createHandleCreatePost(deps: {
  setCommunityPosts: (fn: any) => void;
  navigateTo: (screen: string) => void;
  getUserProfile: () => UserProfileLike;
  getT: () => SocialT;
}) {
  return (content: string, performance?: any, options?: { images?: string[]; recipe?: any; hashtags?: string[] }) => {
    const hashtags = options?.hashtags || extractHashtags(content);
    const profile = deps.getUserProfile();
    const t = deps.getT();
    const name = (profile.name && profile.name.trim()) || t.social.anonymousUser;
    const avatar = profile.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80';
    deps.setCommunityPosts((prev: any[]) => [
      {
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
      },
      ...prev,
    ]);
    deps.navigateTo('explore');
  };
}

export function createHandleAddComment(deps: {
  setCommunityPosts: (fn: any) => void;
  getUserProfile: () => UserProfileLike;
  getT: () => SocialT;
}) {
  return (postId: number, commentText: string) => {
    const profile = deps.getUserProfile();
    const t = deps.getT();
    const author = (profile.name && profile.name.trim()) || t.social.anonymousUser;
    deps.setCommunityPosts((prev: any[]) =>
      prev.map((post: any) =>
        post.id === postId
          ? {
              ...post,
              comments: post.comments + 1,
              commentsList: [
                ...(post.commentsList || []),
                { id: Date.now(), text: commentText, author, authorId: 'self', time: t.social.justNow, createdAt: new Date().toISOString() },
              ],
            }
          : post
      )
    );
  };
}

function extractHashtags(text: string): string[] {
  const matches = text.match(/#(\w+)/g);
  if (!matches) return [];
  return matches.map(m => m.slice(1));
}
