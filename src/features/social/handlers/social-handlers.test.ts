/**
 * Tests for social handler factories (Wave 0 — i18n-aware author + id-based
 * ownership). Guard against regression: no literal `'Tú'` / `'Justo ahora'`
 * should leak into post/comment payloads when an EN i18n bundle is provided.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createHandleCreatePost,
  createHandleAddComment,
} from './social-handlers';

const enT = {
  social: { justNow: 'Just now', anonymousUser: 'Anonymous', member: 'Member' },
};

const esT = {
  social: { justNow: 'Justo ahora', anonymousUser: 'Anónimo', member: 'Miembro' },
};

describe('createHandleCreatePost', () => {
  let setCommunityPosts: ReturnType<typeof vi.fn>;
  let navigateTo: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    setCommunityPosts = vi.fn();
    navigateTo = vi.fn();
  });

  it('uses userProfile.name as author name when provided', () => {
    const handler = createHandleCreatePost({
      setCommunityPosts: setCommunityPosts as any,
      navigateTo: navigateTo as any,
      getUserProfile: () => ({ name: 'Clara', avatar: 'url' }),
      getT: () => enT as any,
    });
    handler('Hello');
    const updater = setCommunityPosts.mock.calls[0][0];
    const result = updater([]);
    expect(result[0].author.name).toBe('Clara');
  });

  it('falls back to t.social.anonymousUser when userProfile.name is empty', () => {
    const handler = createHandleCreatePost({
      setCommunityPosts: setCommunityPosts as any,
      navigateTo: navigateTo as any,
      getUserProfile: () => ({ name: '', avatar: null }),
      getT: () => enT as any,
    });
    handler('Hello');
    const updater = setCommunityPosts.mock.calls[0][0];
    const result = updater([]);
    expect(result[0].author.name).toBe('Anonymous');
  });

  it('uses t.social.justNow for time (EN locale produces "Just now", never "Justo ahora")', () => {
    const handler = createHandleCreatePost({
      setCommunityPosts: setCommunityPosts as any,
      navigateTo: navigateTo as any,
      getUserProfile: () => ({ name: 'Clara' }),
      getT: () => enT as any,
    });
    handler('Hello');
    const updater = setCommunityPosts.mock.calls[0][0];
    const result = updater([]);
    expect(result[0].author.time).toBe('Just now');
    expect(result[0].author.time).not.toBe('Justo ahora');
  });

  it('uses ES labels when given ES bundle', () => {
    const handler = createHandleCreatePost({
      setCommunityPosts: setCommunityPosts as any,
      navigateTo: navigateTo as any,
      getUserProfile: () => ({ name: 'Clara' }),
      getT: () => esT as any,
    });
    handler('Hello');
    const updater = setCommunityPosts.mock.calls[0][0];
    const result = updater([]);
    expect(result[0].author.time).toBe('Justo ahora');
    expect(result[0].author.role).toBe('Miembro');
  });

  it('marks author with id="self" so id-based ownership checks work', () => {
    const handler = createHandleCreatePost({
      setCommunityPosts: setCommunityPosts as any,
      navigateTo: navigateTo as any,
      getUserProfile: () => ({ name: 'Clara' }),
      getT: () => enT as any,
    });
    handler('Hello');
    const updater = setCommunityPosts.mock.calls[0][0];
    const result = updater([]);
    expect(result[0].author.id).toBe('self');
  });

  it('extracts hashtags from content', () => {
    const handler = createHandleCreatePost({
      setCommunityPosts: setCommunityPosts as any,
      navigateTo: navigateTo as any,
      getUserProfile: () => ({ name: 'Clara' }),
      getT: () => enT as any,
    });
    handler('Training #hiit and #cardio');
    const updater = setCommunityPosts.mock.calls[0][0];
    const result = updater([]);
    expect(result[0].hashtags).toEqual(['hiit', 'cardio']);
  });

  it('navigates to explore after posting', () => {
    const handler = createHandleCreatePost({
      setCommunityPosts: setCommunityPosts as any,
      navigateTo: navigateTo as any,
      getUserProfile: () => ({ name: 'Clara' }),
      getT: () => enT as any,
    });
    handler('Hello');
    expect(navigateTo).toHaveBeenCalledWith('explore');
  });
});

describe('createHandleAddComment', () => {
  let setCommunityPosts: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    setCommunityPosts = vi.fn();
  });

  it('adds comment with userProfile.name as author', () => {
    const handler = createHandleAddComment({
      setCommunityPosts: setCommunityPosts as any,
      getUserProfile: () => ({ name: 'Marcos' }),
      getT: () => enT as any,
    });
    handler(1, 'Great post!');
    const updater = setCommunityPosts.mock.calls[0][0];
    const result = updater([{ id: 1, comments: 0, commentsList: [] }]);
    expect(result[0].commentsList[0].author).toBe('Marcos');
    expect(result[0].commentsList[0].text).toBe('Great post!');
  });

  it('tags comment with authorId="self"', () => {
    const handler = createHandleAddComment({
      setCommunityPosts: setCommunityPosts as any,
      getUserProfile: () => ({ name: 'Marcos' }),
      getT: () => enT as any,
    });
    handler(1, 'Hey');
    const updater = setCommunityPosts.mock.calls[0][0];
    const result = updater([{ id: 1, comments: 0, commentsList: [] }]);
    expect(result[0].commentsList[0].authorId).toBe('self');
  });

  it('uses t.social.justNow — never hardcoded "Justo ahora" in EN', () => {
    const handler = createHandleAddComment({
      setCommunityPosts: setCommunityPosts as any,
      getUserProfile: () => ({ name: 'Marcos' }),
      getT: () => enT as any,
    });
    handler(1, 'Hey');
    const updater = setCommunityPosts.mock.calls[0][0];
    const result = updater([{ id: 1, comments: 0, commentsList: [] }]);
    expect(result[0].commentsList[0].time).toBe('Just now');
    expect(result[0].commentsList[0].time).not.toBe('Justo ahora');
  });

  it('increments post.comments counter', () => {
    const handler = createHandleAddComment({
      setCommunityPosts: setCommunityPosts as any,
      getUserProfile: () => ({ name: 'Marcos' }),
      getT: () => enT as any,
    });
    handler(1, 'Hey');
    const updater = setCommunityPosts.mock.calls[0][0];
    const result = updater([{ id: 1, comments: 5, commentsList: [] }]);
    expect(result[0].comments).toBe(6);
  });

  it('only modifies the targeted post, not others', () => {
    const handler = createHandleAddComment({
      setCommunityPosts: setCommunityPosts as any,
      getUserProfile: () => ({ name: 'Marcos' }),
      getT: () => enT as any,
    });
    handler(2, 'Hey');
    const updater = setCommunityPosts.mock.calls[0][0];
    const result = updater([
      { id: 1, comments: 0, commentsList: [] },
      { id: 2, comments: 0, commentsList: [] },
    ]);
    expect(result[0].commentsList).toHaveLength(0); // untouched
    expect(result[1].commentsList).toHaveLength(1);
  });
});
