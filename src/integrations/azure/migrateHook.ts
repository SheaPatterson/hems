/**
 * Feature-flag migration utility for the strangler-fig pattern.
 *
 * Allows incremental hook-by-hook migration from Supabase to Azure.
 * Each hook can be independently set to one of three modes:
 *   - 'supabase' — use the original Supabase implementation (default)
 *   - 'azure'    — use the new Azure implementation
 *   - 'shadow'   — run both, return Supabase result, log discrepancies
 *
 * Flag values are read from:
 *   1. Environment variables: VITE_MIGRATION_FLAG_{hookName}
 *   2. Runtime config (in-memory Map, updatable at runtime)
 *   3. Default: 'supabase'
 *
 * IMPORTANT: Both implementations are React hooks and must be called
 * unconditionally to satisfy the Rules of Hooks. In shadow mode both
 * hooks execute but only the Supabase result is returned to the consumer.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type MigrationMode = 'supabase' | 'azure' | 'shadow';

// ---------------------------------------------------------------------------
// Runtime config store
// ---------------------------------------------------------------------------

const runtimeFlags = new Map<string, MigrationMode>();

/**
 * Set a migration flag at runtime (e.g. from an admin panel or config fetch).
 */
export function setMigrationFlag(hookName: string, mode: MigrationMode): void {
  runtimeFlags.set(hookName, mode);
}

/**
 * Clear a runtime flag so the hook falls back to env / default.
 */
export function clearMigrationFlag(hookName: string): void {
  runtimeFlags.delete(hookName);
}

/**
 * Clear all runtime flags (useful in tests).
 */
export function clearAllMigrationFlags(): void {
  runtimeFlags.clear();
}

// ---------------------------------------------------------------------------
// Flag resolution
// ---------------------------------------------------------------------------

function readEnvFlag(featureFlag: string): MigrationMode | undefined {
  // Vite exposes VITE_-prefixed env vars on import.meta.env
  try {
    const value = (import.meta as any).env?.[`VITE_MIGRATION_FLAG_${featureFlag}`] as
      | string
      | undefined;
    if (value === 'supabase' || value === 'azure' || value === 'shadow') {
      return value;
    }
  } catch {
    // import.meta.env may not exist in test / SSR environments
  }
  return undefined;
}

/**
 * Resolve the current migration mode for a given feature flag key.
 * Priority: runtime config > environment variable > 'supabase' default.
 */
export function getMigrationMode(featureFlag: string): MigrationMode {
  const runtime = runtimeFlags.get(featureFlag);
  if (runtime) return runtime;

  const env = readEnvFlag(featureFlag);
  if (env) return env;

  return 'supabase';
}

// ---------------------------------------------------------------------------
// Discrepancy logging
// ---------------------------------------------------------------------------

function logDiscrepancy(hookName: string, supabaseResult: unknown, azureResult: unknown): void {
  const message = `[migrateHook:shadow] Discrepancy in "${hookName}"`;
  console.warn(message, {
    supabase: supabaseResult,
    azure: azureResult,
  });

  // If Application Insights is available on the window, track the event
  try {
    const appInsights = (window as any).appInsights;
    if (appInsights?.trackEvent) {
      appInsights.trackEvent({
        name: 'MigrationDiscrepancy',
        properties: {
          hookName,
          supabaseResult: JSON.stringify(supabaseResult),
          azureResult: JSON.stringify(azureResult),
        },
      });
    }
  } catch {
    // Silently ignore — App Insights is optional
  }
}

/**
 * Shallow-compare two values to detect discrepancies in shadow mode.
 * Uses JSON serialisation for a quick structural comparison.
 */
function resultsMatch(a: unknown, b: unknown): boolean {
  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Core migration wrapper
// ---------------------------------------------------------------------------

/**
 * Wrap a pair of Supabase / Azure hook implementations behind a feature flag.
 *
 * Returns a new hook function with the same signature. Both implementations
 * are always called (Rules of Hooks) but only the active one's result is
 * returned to the consumer.
 *
 * @param hookName     Human-readable name for logging (e.g. "useHemsData")
 * @param supabaseImpl The original Supabase hook
 * @param azureImpl    The new Azure hook
 * @param featureFlag  Key used to look up the migration mode
 */
export function migrateHookToAzure<T>(
  hookName: string,
  supabaseImpl: () => T,
  azureImpl: () => T,
  featureFlag: string,
): () => T {
  return function useMigratedHook(): T {
    // Both hooks MUST be called unconditionally (React rules of hooks).
    const supabaseResult = supabaseImpl();
    const azureResult = azureImpl();

    const mode = getMigrationMode(featureFlag);

    if (mode === 'azure') {
      return azureResult;
    }

    // 'supabase' or 'shadow' — always return the Supabase result
    if (mode === 'shadow') {
      // Compare results and log discrepancies (fire-and-forget)
      if (!resultsMatch(supabaseResult, azureResult)) {
        logDiscrepancy(hookName, supabaseResult, azureResult);
      }
    }

    return supabaseResult;
  };
}
