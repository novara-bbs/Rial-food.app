import type { CommunityPost } from '../../../types/social';

interface UserContext {
  followedCreators: string[];
  likedPosts: number[];
  savedPosts: number[];
}

/**
 * Score a single post for the "For You" feed.
 * Weighted composite: social proof (30%), recency (25%), affinity (25%), match (20%).
 */
export function scoreFeedItem(post: CommunityPost, ctx: UserContext): number {
  // Social proof: likes + saves (normalized, max ~1000 as baseline)
  const socialScore = Math.min((post.likes + (post.saves || 0)) / 500, 1) * 30;

  // Recency: exponential decay over 48h
  const ageMs = Date.now() - new Date(post.createdAt || Date.now()).getTime();
  const ageHours = ageMs / 3600000;
  const recencyScore = Math.max(0, 1 - ageHours / 48) * 25;

  // Creator affinity: is the author followed? Have we liked their content before?
  const isFollowed = post.author?.id ? ctx.followedCreators.includes(post.author.id) : false;
  const affinityScore = (isFollowed ? 20 : 0) + (ctx.likedPosts.includes(post.id) ? 5 : 0);

  // Content match: recipe posts get a small boost (richer content)
  const matchScore = post.type === 'recipe' ? 15 : post.type === 'performance' ? 10 : 5;

  return socialScore + recencyScore + affinityScore + matchScore;
}

/**
 * Rank a feed by composite score (descending).
 */
export function rankFeed(posts: CommunityPost[], ctx: UserContext): CommunityPost[] {
  return [...posts].sort((a, b) => scoreFeedItem(b, ctx) - scoreFeedItem(a, ctx));
}

/**
 * Filter to only posts from followed creators.
 */
export function getFollowingFeed(posts: CommunityPost[], followedCreators: string[]): CommunityPost[] {
  return posts.filter(p => p.author?.id && followedCreators.includes(p.author.id));
}

/**
 * Get trending posts (most engagement in last 7 days).
 */
export function getTrendingFeed(posts: CommunityPost[]): CommunityPost[] {
  const weekAgo = Date.now() - 7 * 86400000;
  return [...posts]
    .filter(p => new Date(p.createdAt || 0).getTime() > weekAgo)
    .sort((a, b) => (b.likes + b.comments) - (a.likes + a.comments));
}

/**
 * Recommend creators the user might like.
 */
export function getCreatorRecommendations(
  followedCreators: string[],
  allCreatorIds: { id: string; name: string; avatar: string; recipes: number }[],
  limit = 3
): { id: string; name: string; avatar: string; recipes: number }[] {
  return allCreatorIds
    .filter(c => !followedCreators.includes(c.id))
    .sort((a, b) => b.recipes - a.recipes)
    .slice(0, limit);
}
