export function createHandleCreatePost(deps: { setCommunityPosts: (fn: any) => void; navigateTo: (screen: string) => void }) {
  return (content: string, performance?: any, options?: { images?: string[]; recipe?: any; hashtags?: string[] }) => {
    const hashtags = options?.hashtags || extractHashtags(content);
    deps.setCommunityPosts((prev: any[]) => [
      {
        id: Date.now(),
        author: { id: 'self', name: 'Tú', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80', role: 'Miembro', time: 'Justo ahora' },
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

export function createHandleAddComment(deps: { setCommunityPosts: (fn: any) => void }) {
  return (postId: number, commentText: string) => {
    deps.setCommunityPosts((prev: any[]) =>
      prev.map((post: any) =>
        post.id === postId
          ? {
              ...post,
              comments: post.comments + 1,
              commentsList: [...(post.commentsList || []), { id: Date.now(), text: commentText, author: 'Tú', time: 'Justo ahora' }],
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
