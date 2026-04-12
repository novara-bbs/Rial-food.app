/**
 * Tests for useOnlineStatus hook.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useOnlineStatus } from './useOnlineStatus';

describe('useOnlineStatus', () => {
  beforeEach(() => {
    // Reset to online before each test
    Object.defineProperty(navigator, 'onLine', { value: true, configurable: true, writable: true });
  });

  it('returns true when navigator.onLine is true', () => {
    Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });
    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current).toBe(true);
  });

  it('returns false when navigator.onLine is false', () => {
    Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });
    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current).toBe(false);
  });

  it('updates to false when offline event fires', () => {
    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current).toBe(true);

    act(() => {
      window.dispatchEvent(new Event('offline'));
    });

    expect(result.current).toBe(false);
  });

  it('updates to true when online event fires', () => {
    Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });
    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current).toBe(false);

    act(() => {
      window.dispatchEvent(new Event('online'));
    });

    expect(result.current).toBe(true);
  });

  it('can toggle between online and offline', () => {
    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current).toBe(true);

    act(() => { window.dispatchEvent(new Event('offline')); });
    expect(result.current).toBe(false);

    act(() => { window.dispatchEvent(new Event('online')); });
    expect(result.current).toBe(true);

    act(() => { window.dispatchEvent(new Event('offline')); });
    expect(result.current).toBe(false);
  });

  it('removes event listeners on unmount (no memory leak)', () => {
    const addSpy = vi.spyOn(window, 'addEventListener');
    const removeSpy = vi.spyOn(window, 'removeEventListener');

    const { unmount } = renderHook(() => useOnlineStatus());

    const onlineAdded = addSpy.mock.calls.filter((args) => args[0] === 'online').length;
    const offlineAdded = addSpy.mock.calls.filter((args) => args[0] === 'offline').length;
    expect(onlineAdded).toBeGreaterThanOrEqual(1);
    expect(offlineAdded).toBeGreaterThanOrEqual(1);

    unmount();

    const onlineRemoved = removeSpy.mock.calls.filter((args) => args[0] === 'online').length;
    const offlineRemoved = removeSpy.mock.calls.filter((args) => args[0] === 'offline').length;
    expect(onlineRemoved).toBeGreaterThanOrEqual(1);
    expect(offlineRemoved).toBeGreaterThanOrEqual(1);
  });

  it('multiple hooks instances respond independently', () => {
    const { result: result1 } = renderHook(() => useOnlineStatus());
    const { result: result2 } = renderHook(() => useOnlineStatus());

    expect(result1.current).toBe(true);
    expect(result2.current).toBe(true);

    act(() => { window.dispatchEvent(new Event('offline')); });

    expect(result1.current).toBe(false);
    expect(result2.current).toBe(false);
  });
});
