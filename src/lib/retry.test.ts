/**
 * Tests for withRetry exponential backoff utility.
 * Uses baseDelay: 0 to avoid actual waits in tests.
 */
import { describe, it, expect, vi } from 'vitest';
import { withRetry } from './retry';

describe('withRetry', () => {
  it('returns result immediately on first-try success', async () => {
    const fn = vi.fn().mockResolvedValue('success');
    const result = await withRetry(fn, { maxRetries: 3, baseDelay: 0 });
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('retries on failure and succeeds on second attempt', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValueOnce('ok');
    const result = await withRetry(fn, { maxRetries: 2, baseDelay: 0 });
    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('retries up to maxRetries times then throws', async () => {
    const err = new Error('persistent fail');
    const fn = vi.fn().mockRejectedValue(err);
    await expect(withRetry(fn, { maxRetries: 2, baseDelay: 0 })).rejects.toThrow('persistent fail');
    // 1 initial + 2 retries = 3 total calls
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('uses maxRetries=3 by default', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('fail'));
    await expect(withRetry(fn, { baseDelay: 0 })).rejects.toThrow();
    expect(fn).toHaveBeenCalledTimes(4); // 1 + 3 retries
  });

  it('succeeds on last allowed retry', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('fail 1'))
      .mockRejectedValueOnce(new Error('fail 2'))
      .mockResolvedValueOnce('final success');
    const result = await withRetry(fn, { maxRetries: 2, baseDelay: 0 });
    expect(result).toBe('final success');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('rethrows non-Error rejections', async () => {
    const fn = vi.fn().mockRejectedValue('string error');
    await expect(withRetry(fn, { maxRetries: 1, baseDelay: 0 })).rejects.toBe('string error');
  });

  it('works with maxRetries=0 — no retries, throws immediately', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('instant fail'));
    await expect(withRetry(fn, { maxRetries: 0, baseDelay: 0 })).rejects.toThrow('instant fail');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('returns correct value type (not just string)', async () => {
    const fn = vi.fn().mockResolvedValue({ count: 42 });
    const result = await withRetry(fn, { maxRetries: 1, baseDelay: 0 });
    expect(result).toEqual({ count: 42 });
  });

  it('passes label option without error', async () => {
    const fn = vi.fn().mockResolvedValue('done');
    const result = await withRetry(fn, { maxRetries: 1, baseDelay: 0, label: 'TestRequest' });
    expect(result).toBe('done');
  });
});
