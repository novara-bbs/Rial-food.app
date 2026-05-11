/**
 * Health provider abstraction — Sprint E [1.5.219] Phase 3.
 *
 * `HealthProvider` is the interface every health data source must implement.
 * Concrete implementations live in `src/lib/health/providers/`. The registry
 * (`src/lib/health/registry.ts`) is the single entry point for feature code.
 *
 * Design goals:
 *  1. Feature code never imports providers directly — only the registry.
 *  2. Adding a new source = one file in `providers/` + one line in `registry.ts`.
 *  3. Providers are pure modules (no React) so they can be unit-tested in Node.
 *  4. Dynamic imports isolate optional native plugins from the main bundle.
 *
 * @see src/lib/health/registry.ts
 * @see docs/adr/ADR-017-user-preferences.md
 */

import type { HealthPermission, HealthSourceId } from '../../types/preferences';

// ─── Metrics snapshot ─────────────────────────────────────────────────────────

/**
 * Flattened snapshot of whatever a health source can provide for today (or
 * the last recorded value). All fields are optional — a source reports only
 * what it supports and has permission to read.
 *
 * Consumers should treat absent fields as "unknown", not "zero".
 */
export interface HealthMetrics {
  /** Total step count for the current calendar day. */
  steps?: number;
  /** Total walking/running distance in metres for today. */
  distanceMeters?: number;
  /** Active workout minutes today (intentional exercise sessions). */
  workoutMinutes?: number;
  /** Total sleep duration in decimal hours for the last night. */
  sleepHours?: number;
  /**
   * Heart rate variability in milliseconds. Interpretation is source-specific
   * (RMSSD for Apple Health, SDNN for some Garmin devices). Show the raw
   * number; do not normalise between sources.
   */
  hrv?: number;
  /** Resting heart rate in beats per minute (morning measurement or 7-day avg). */
  restingHrBpm?: number;
  /** Body weight in kilograms (last recorded). */
  weightKg?: number;
  /** Standing height in centimetres (last recorded). */
  heightCm?: number;
  /** Blood glucose in mmol/L (last CGM reading). */
  glucoseMmol?: number;
  /** Biological sex as reported by the source. */
  biologicalSex?: 'male' | 'female';
  /** Date of birth (used for age-based TDEE calculations). */
  birthDate?: Date;
}

// ─── Provider interface ───────────────────────────────────────────────────────

/**
 * The common interface every health provider must implement.
 *
 * Implementations are registered in `src/lib/health/registry.ts`. Feature
 * code must never import a provider file directly — use the registry helpers
 * (`getPlatformProviders`, `getActiveProviders`, etc.) instead.
 *
 * All async methods must be resilient: they should return partial data rather
 * than throw, so that a failure in one provider never breaks the UI.
 */
export interface HealthProvider {
  /**
   * Stable identifier matching `HealthSourceId`. Used by the registry for
   * lookups and by `UserPreferences.healthSources` for persistence.
   */
  readonly id: HealthSourceId;

  /**
   * Human-readable provider name shown in Settings and permission prompts.
   * Keep it short (≤ 20 characters).
   */
  readonly label: string;

  /**
   * Synchronous platform check called before any UI renders. Must not throw.
   * Return `false` if the required native plugin or OAuth flow cannot be
   * initiated on the current platform.
   */
  isAvailable(): boolean;

  /**
   * The full set of `HealthPermission` values this provider is capable of
   * supplying (regardless of what the user has granted so far).
   */
  supportedPermissions(): HealthPermission[];

  /**
   * Ask the user (or platform) to grant the listed permissions.
   *
   * @param permissions The subset of `supportedPermissions()` to request.
   * @returns The subset that was actually granted. May be empty.
   */
  requestPermissions(permissions: HealthPermission[]): Promise<HealthPermission[]>;

  /**
   * Fetch a metrics snapshot for the permissions that have been granted.
   *
   * Implementations MUST NOT throw. Catch internal errors and return a partial
   * `HealthMetrics` object (possibly `{}`). The caller treats missing fields
   * as "unknown", so a partial result is always preferable to an exception.
   *
   * @param permissions The granted permissions to read data for.
   */
  fetchMetrics(permissions: HealthPermission[]): Promise<HealthMetrics>;
}
