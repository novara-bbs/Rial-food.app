import { describe, it, expect } from 'vitest';
import { parseVideoSource, platformLabel } from './videoEmbed';

describe('parseVideoSource', () => {
  it('returns null for empty or non-string input', () => {
    expect(parseVideoSource(undefined)).toBeNull();
    expect(parseVideoSource(null)).toBeNull();
    expect(parseVideoSource('')).toBeNull();
    expect(parseVideoSource('   ')).toBeNull();
  });

  it('returns null for malformed URLs', () => {
    expect(parseVideoSource('http://')).toBeNull();
  });

  it('parses canonical YouTube watch URLs', () => {
    const res = parseVideoSource('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    expect(res?.platform).toBe('youtube');
    expect(res?.canEmbed).toBe(true);
    expect(res?.videoId).toBe('dQw4w9WgXcQ');
    expect(res?.embedUrl).toBe('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ');
    expect(res?.posterUrl).toBe('https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg');
  });

  it('parses youtu.be short URLs', () => {
    const res = parseVideoSource('https://youtu.be/abc123XYZ_-');
    expect(res?.platform).toBe('youtube');
    expect(res?.videoId).toBe('abc123XYZ_-');
    expect(res?.canEmbed).toBe(true);
  });

  it('parses YouTube Shorts URLs', () => {
    const res = parseVideoSource('https://www.youtube.com/shorts/abcDEF12345');
    expect(res?.platform).toBe('youtube');
    expect(res?.videoId).toBe('abcDEF12345');
  });

  it('parses TikTok video URLs and marks them as non-embeddable', () => {
    const res = parseVideoSource('https://www.tiktok.com/@chef.carlos/video/7123456789012345678');
    expect(res?.platform).toBe('tiktok');
    expect(res?.canEmbed).toBe(false);
    expect(res?.videoId).toBe('7123456789012345678');
    expect(res?.embedUrl).toBeNull();
    expect(res?.watchUrl).toContain('tiktok.com');
  });

  it('parses Instagram reel URLs and marks them as non-embeddable', () => {
    const res = parseVideoSource('https://www.instagram.com/reel/CABC_def-123/');
    expect(res?.platform).toBe('instagram');
    expect(res?.canEmbed).toBe(false);
    expect(res?.videoId).toBe('CABC_def-123');
  });

  it('parses Instagram post URLs', () => {
    const res = parseVideoSource('https://www.instagram.com/p/CXYZ_123/');
    expect(res?.platform).toBe('instagram');
    expect(res?.videoId).toBe('CXYZ_123');
  });

  it('parses Vimeo URLs', () => {
    const res = parseVideoSource('https://vimeo.com/123456789');
    expect(res?.platform).toBe('vimeo');
    expect(res?.videoId).toBe('123456789');
    expect(res?.canEmbed).toBe(false);
  });

  it('falls back to "other" platform for unknown hosts', () => {
    const res = parseVideoSource('https://example.com/video/foo');
    expect(res?.platform).toBe('other');
    expect(res?.canEmbed).toBe(false);
    expect(res?.watchUrl).toContain('example.com');
  });

  it('accepts URLs without protocol', () => {
    const res = parseVideoSource('youtube.com/watch?v=XYZabc12345');
    expect(res?.platform).toBe('youtube');
    expect(res?.videoId).toBe('XYZabc12345');
  });

  it('ignores trailing query strings that are not `v`', () => {
    const res = parseVideoSource('https://www.youtube.com/watch?v=abc123XYZ_-&t=30s');
    expect(res?.videoId).toBe('abc123XYZ_-');
  });
});

describe('platformLabel', () => {
  it('returns human-readable labels per platform', () => {
    expect(platformLabel('youtube')).toBe('YouTube');
    expect(platformLabel('tiktok')).toBe('TikTok');
    expect(platformLabel('instagram')).toBe('Instagram');
    expect(platformLabel('vimeo')).toBe('Vimeo');
    expect(platformLabel('other')).toBe('Web');
  });
});
