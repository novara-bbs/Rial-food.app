/**
 * Regression tests for the P10-post navigation history stack fix.
 *
 * Covers the chained substitute drill-down scenario:
 *   Diccionario → Pollo detail → tap "Sin pollo? Prueba pavo" → Pavo detail
 *   → tap "Sin pavo? Prueba tofu" → Tofu detail → BACK
 * `goBack` must restore the Pavo familyId (not crash, not fallback to home).
 */
import { describe, it, expect } from 'vitest';
import { render, act } from '@testing-library/react';
import { NavigationProvider, useNavigation } from './NavigationContext';

function captureHook<T>() {
  const ref: { current: T | null } = { current: null };
  function Reader({ capture }: { capture: () => T }) {
    ref.current = capture();
    return null;
  }
  return { ref, Reader };
}

describe('NavigationContext — history stack', () => {
  it('navigateTo + goBack restores the previous screen AND its screenData', () => {
    const { ref, Reader } = captureHook<ReturnType<typeof useNavigation>>();
    render(
      <NavigationProvider>
        <Reader capture={() => useNavigation()} />
      </NavigationProvider>,
    );
    // Starts at home
    expect(ref.current?.currentScreen).toBe('home');
    expect(ref.current?.screenData).toBeUndefined();

    // Navigate to food-detail with {familyId: A}
    act(() => ref.current?.navigateTo('food-detail', { familyId: 'fam_chicken_breast' }));
    expect(ref.current?.currentScreen).toBe('food-detail');
    expect(ref.current?.screenData).toEqual({ familyId: 'fam_chicken_breast' });

    // Navigate again to food-detail with {familyId: B}
    act(() => ref.current?.navigateTo('food-detail', { familyId: 'fam_turkey_breast' }));
    expect(ref.current?.screenData).toEqual({ familyId: 'fam_turkey_breast' });

    // goBack → restores the FIRST food-detail navigation with familyId: A
    act(() => ref.current?.goBack());
    expect(ref.current?.currentScreen).toBe('food-detail');
    expect(ref.current?.screenData).toEqual({ familyId: 'fam_chicken_breast' });

    // goBack again → home
    act(() => ref.current?.goBack());
    expect(ref.current?.currentScreen).toBe('home');
    expect(ref.current?.screenData).toBeUndefined();
  });

  it('goBack on the root of the stack is a no-op (does not crash)', () => {
    const { ref, Reader } = captureHook<ReturnType<typeof useNavigation>>();
    render(
      <NavigationProvider>
        <Reader capture={() => useNavigation()} />
      </NavigationProvider>,
    );
    const before = ref.current?.currentScreen;
    act(() => ref.current?.goBack());
    expect(ref.current?.currentScreen).toBe(before);
  });

  it('previousScreen reflects the item under the stack top', () => {
    const { ref, Reader } = captureHook<ReturnType<typeof useNavigation>>();
    render(
      <NavigationProvider>
        <Reader capture={() => useNavigation()} />
      </NavigationProvider>,
    );
    act(() => ref.current?.navigateTo('food-dictionary'));
    act(() => ref.current?.navigateTo('food-detail', { familyId: 'fam_quinoa' }));
    expect(ref.current?.previousScreen).toBe('food-dictionary');
  });

  it('chained substitute drill-down (A → B → C → back → back) preserves ids', () => {
    const { ref, Reader } = captureHook<ReturnType<typeof useNavigation>>();
    render(
      <NavigationProvider>
        <Reader capture={() => useNavigation()} />
      </NavigationProvider>,
    );
    act(() => ref.current?.navigateTo('food-dictionary'));
    act(() => ref.current?.navigateTo('food-detail', { familyId: 'A' }));
    act(() => ref.current?.navigateTo('food-detail', { familyId: 'B' }));
    act(() => ref.current?.navigateTo('food-detail', { familyId: 'C' }));

    act(() => ref.current?.goBack());
    expect(ref.current?.screenData).toEqual({ familyId: 'B' });

    act(() => ref.current?.goBack());
    expect(ref.current?.screenData).toEqual({ familyId: 'A' });

    act(() => ref.current?.goBack());
    expect(ref.current?.currentScreen).toBe('food-dictionary');
    expect(ref.current?.screenData).toBeUndefined();
  });

  it('collapses duplicate zero-data self-navigations (navigateTo home on home)', () => {
    const { ref, Reader } = captureHook<ReturnType<typeof useNavigation>>();
    render(
      <NavigationProvider>
        <Reader capture={() => useNavigation()} />
      </NavigationProvider>,
    );
    // Already on home. navigateTo('home') without data should be a no-op.
    act(() => ref.current?.navigateTo('home'));
    act(() => ref.current?.navigateTo('home'));
    // goBack from here should NOT leave us on home — stack never grew.
    act(() => ref.current?.goBack());
    expect(ref.current?.currentScreen).toBe('home');
  });

  it('collapses self-navigation but preserves substitute drill-down with different data', () => {
    const { ref, Reader } = captureHook<ReturnType<typeof useNavigation>>();
    render(
      <NavigationProvider>
        <Reader capture={() => useNavigation()} />
      </NavigationProvider>,
    );
    act(() => ref.current?.navigateTo('food-detail', { familyId: 'A' }));
    act(() => ref.current?.navigateTo('food-detail', { familyId: 'B' }));
    // Even though both calls are to the same screen, the data differs →
    // stack grows because the substitute drill-down depends on it.
    act(() => ref.current?.goBack());
    expect(ref.current?.screenData).toEqual({ familyId: 'A' });
  });
});
