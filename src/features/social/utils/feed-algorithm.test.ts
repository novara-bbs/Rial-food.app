/**
 * Tests for the social feed ranking algorithm.
 * Covers: scoreFeedItem, rankFeed, getFollowingFeed, getTrendingFeed, getCreatorRecommendations
 */
import { describe, it, expect } from 'vitest';
import { scoreFeedItem, rankFeed, getFollowingFeed, getTrendingFeed, getCreatorRecommendations } from './feed-algorithm';
import type { CommunityPost } from '../../../types/social';

// ─── Fixtures ────────────────────────────────────────────────────────────────

const makeAuthor = (id = 'author-1') => ({
  id,
  name: `Author ${id}`,
  img: '',
  role: 'creator',
  time: '2h',
  verified: false,
});

const makePost = (overrides: Partial<CommunityPost> = {}): CommunityPost => ({
  id: 1,
  type: 'recipe',
  content: 'Test post',
  likes: 0,
  comments: 0,
  saves: 0,
  commentsList: [],
  createdAt: new Date().toISOString(),
  author: makeAuthor(),
  ...overrides,
});

const baseCtx = {
  followedCreators: [] as string[],
  likedPosts: [] as number[],
  savedPosts: [] as number[],
};

// ─── scoreFeedItem ────────────────────────────────────────────────────────────

describe('scoreFeedItem', () => {
  it('returns a non-negative number', () => {
    const post = makePost();
    const score = scoreFeedItem(post, baseCtx);
    expect(score).toBeGreaterThanOrEqual(0);
  });

  it('scores recent posts higher than stale posts (same social proof)', () => {
    const recent = makePost({ id: 1, likes: 50, createdAt: new Date().toISOString() });
    const stale  = makePost({ id: 2, likes: 50, createdAt: new Date(Date.now() - 72 * 3600000).toISOString() });
    expect(scoreFeedItem(recent, baseCtx)).toBeGreaterThan(scoreFeedItem(stale, baseCtx));
  });

  it('scores popular posts higher than unpopular ones (same age)', () => {
    const popular   = makePost({ id: 1, likes: 500, saves: 200, createdAt: new Date().toISOString() });
    const unpopular = makePost({ id: 2, likes: 0,   saves: 0,   createdAt: new Date().toISOString() });
    expect(scoreFeedItem(popular, baseCtx)).toBeGreaterThan(scoreFeedItem(unpopular, baseCtx));
  });

  it('boosts score for followed creator posts', () => {
    const post = makePost({ id: 1, author: makeAuthor('followed-1') });
    const ctxFollowing = { ...baseCtx, followedCreators: ['followed-1'] };
    expect(scoreFeedItem(post, ctxFollowing)).toBeGreaterThan(scoreFeedItem(post, baseCtx));
  });

  it('scores recipe type posts above text posts', () => {
    const recipe = makePost({ id: 1, type: 'recipe',      createdAt: new Date().toISOString() });
    const text   = makePost({ id: 2, type: 'performance', createdAt: new Date().toISOString() });
    expect(scoreFeedItem(recipe, baseCtx)).toBeGreaterThanOrEqual(scoreFeedItem(text, baseCtx));
  });

  it('never goes negative for very stale posts', () => {
    const stale = makePost({ createdAt: new Date(Date.now() - 7 * 86400000).toISOString(), likes: 0 });
    expect(scoreFeedItem(stale, baseCtx)).toBeGreaterThanOrEqual(0);
  });
});

// ─── rankFeed ─────────────────────────────────────────────────────────────────

describe('rankFeed', () => {
  it('returns posts sorted by score descending', () => {
    const posts = [
      makePost({ id: 1, likes: 0,   saves: 0,   createdAt: new Date(Date.now() - 60 * 3600000).toISOString() }),
      makePost({ id: 2, likes: 500, saves: 100, createdAt: new Date().toISOString() }),
      makePost({ id: 3, likes: 10,  saves: 5,   createdAt: new Date().toISOString() }),
    ];
    const ranked = rankFeed(posts, baseCtx);
    expect(ranked[0].id).toBe(2);
    expect(ranked[ranked.length - 1].id).toBe(1);
  });

  it('does not mutate the original array', () => {
    const posts = [makePost({ id: 1, likes: 100 }), makePost({ id: 2, likes: 0 })];
    const before = posts.map(p => p.id);
    rankFeed(posts, baseCtx);
    expect(posts.map(p => p.id)).toEqual(before);
  });

  it('handles empty array', () => {
    expect(rankFeed([], baseCtx)).toEqual([]);
  });
});

// ─── getFollowingFeed ─────────────────────────────────────────────────────────

describe('getFollowingFeed', () => {
  it('returns only posts from followed creators', () => {
    const posts = [
      makePost({ id: 1, author: makeAuthor('creator-1') }),
      makePost({ id: 2, author: makeAuthor('creator-2') }),
      makePost({ id: 3, author: makeAuthor('creator-1') }),
    ];
    const result = getFollowingFeed(posts, ['creator-1']);
    expect(result).toHaveLength(2);
    expect(result.every(p => p.author.id === 'creator-1')).toBe(true);
  });

  it('returns empty array when following nobody', () => {
    expect(getFollowingFeed([makePost(), makePost({ id: 2 })], [])).toHaveLength(0);
  });

  it('returns empty when none of the posts match followed creators', () => {
    const posts = [makePost({ author: makeAuthor('c-unknown') })];
    expect(getFollowingFeed(posts, ['c-1', 'c-2'])).toHaveLength(0);
  });
});

// ─── getTrendingFeed ──────────────────────────────────────────────────────────

describe('getTrendingFeed', () => {
  it('excludes posts older than 7 days', () => {
    const recent = makePost({ id: 1, createdAt: new Date().toISOString(),                              likes: 10, comments: 5 });
    const old    = makePost({ id: 2, createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),    likes: 1000, comments: 500 });
    const result = getTrendingFeed([recent, old]);
    expect(result.some(p => p.id === old.id)).toBe(false);
    expect(result.some(p => p.id === recent.id)).toBe(true);
  });

  it('sorts by likes + comments descending', () => {
    const now = new Date().toISOString();
    const top = makePost({ id: 1, createdAt: now, likes: 200, comments: 50 });
    const mid = makePost({ id: 2, createdAt: now, likes: 50,  comments: 10 });
    const low = makePost({ id: 3, createdAt: now, likes: 5,   comments: 1  });
    const result = getTrendingFeed([low, top, mid]);
    expect(result[0].id).toBe(1);
    expect(result[result.length - 1].id).toBe(3);
  });

  it('handles empty input', () => {
    expect(getTrendingFeed([])).toEqual([]);
  });
});

// ─── getCreatorRecommendations ────────────────────────────────────────────────

describe('getCreatorRecommendations', () => {
  const creators = [
    { id: 'c-1', name: 'Chef A', avatar: '/a.jpg', recipes: 50 },
    { id: 'c-2', name: 'Chef B', avatar: '/b.jpg', recipes: 20 },
    { id: 'c-3', name: 'Chef C', avatar: '/c.jpg', recipes: 80 },
  ];

  it('does not recommend already-followed creators', () => {
    const result = getCreatorRecommendations(['c-1'], creators);
    expect(result.map(r => r.id)).not.toContain('c-1');
  });

  it('sorts by recipe count descending (popularity proxy)', () => {
    const result = getCreatorRecommendations([], creators);
    expect(result[0].id).toBe('c-3'); // 80 recipes
    expect(result[1].id).toBe('c-1'); // 50 recipes
  });

  it('respects the limit parameter', () => {
    const result = getCreatorRecommendations([], creators, 2);
    expect(result).toHaveLength(2);
  });

  it('returns empty when all creators are already followed', () => {
    const result = getCreatorRecommendations(['c-1', 'c-2', 'c-3'], creators);
    expect(result).toHaveLength(0);
  });
});
