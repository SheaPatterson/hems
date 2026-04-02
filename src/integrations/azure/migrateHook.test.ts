import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  migrateHookToAzure,
  getMigrationMode,
  setMigrationFlag,
  clearMigrationFlag,
  clearAllMigrationFlags,
  type MigrationMode,
} from './migrateHook';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

beforeEach(() => {
  clearAllMigrationFlags();
});

afterEach(() => {
  clearAllMigrationFlags();
  vi.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// getMigrationMode
// ---------------------------------------------------------------------------

describe('getMigrationMode', () => {
  it('defaults to supabase when no flag is set', () => {
    expect(getMigrationMode('useHemsData')).toBe('supabase');
  });

  it('returns runtime flag when set', () => {
    setMigrationFlag('useHemsData', 'azure');
    expect(getMigrationMode('useHemsData')).toBe('azure');
  });

  it('returns shadow when runtime flag is shadow', () => {
    setMigrationFlag('useHemsData', 'shadow');
    expect(getMigrationMode('useHemsData')).toBe('shadow');
  });

  it('clearMigrationFlag reverts to default', () => {
    setMigrationFlag('useHemsData', 'azure');
    clearMigrationFlag('useHemsData');
    expect(getMigrationMode('useHemsData')).toBe('supabase');
  });

  it('clearAllMigrationFlags reverts all flags', () => {
    setMigrationFlag('useHemsData', 'azure');
    setMigrationFlag('useMissions', 'shadow');
    clearAllMigrationFlags();
    expect(getMigrationMode('useHemsData')).toBe('supabase');
    expect(getMigrationMode('useMissions')).toBe('supabase');
  });
});

// ---------------------------------------------------------------------------
// migrateHookToAzure — mode switching
// ---------------------------------------------------------------------------

describe('migrateHookToAzure', () => {
  const supabaseData = { source: 'supabase', items: [1, 2, 3] };
  const azureData = { source: 'azure', items: [1, 2, 3] };

  function useSupabaseHook() {
    return supabaseData;
  }
  function useAzureHook() {
    return azureData;
  }

  it('returns supabase result when mode is supabase (default)', () => {
    const useHook = migrateHookToAzure('useTest', useSupabaseHook, useAzureHook, 'useTest');
    const result = useHook();
    expect(result).toBe(supabaseData);
  });

  it('returns azure result when mode is azure', () => {
    setMigrationFlag('useTest', 'azure');
    const useHook = migrateHookToAzure('useTest', useSupabaseHook, useAzureHook, 'useTest');
    const result = useHook();
    expect(result).toBe(azureData);
  });

  it('returns supabase result when mode is shadow', () => {
    setMigrationFlag('useTest', 'shadow');
    const useHook = migrateHookToAzure('useTest', useSupabaseHook, useAzureHook, 'useTest');
    const result = useHook();
    expect(result).toBe(supabaseData);
  });

  it('calls both implementations unconditionally regardless of mode', () => {
    const supabaseSpy = vi.fn(() => 'sb');
    const azureSpy = vi.fn(() => 'az');

    const modes: MigrationMode[] = ['supabase', 'azure', 'shadow'];
    for (const mode of modes) {
      supabaseSpy.mockClear();
      azureSpy.mockClear();
      setMigrationFlag('useTest', mode);

      const useHook = migrateHookToAzure('useTest', supabaseSpy, azureSpy, 'useTest');
      useHook();

      expect(supabaseSpy).toHaveBeenCalledTimes(1);
      expect(azureSpy).toHaveBeenCalledTimes(1);
    }
  });
});

// ---------------------------------------------------------------------------
// migrateHookToAzure — shadow mode discrepancy logging
// ---------------------------------------------------------------------------

describe('migrateHookToAzure — shadow mode', () => {
  it('logs a warning when results differ', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    setMigrationFlag('useTest', 'shadow');

    const useHook = migrateHookToAzure(
      'useTest',
      () => ({ value: 'supabase' }),
      () => ({ value: 'azure' }),
      'useTest',
    );
    useHook();

    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy.mock.calls[0][0]).toContain('Discrepancy');
    expect(warnSpy.mock.calls[0][0]).toContain('useTest');
  });

  it('does not log when results match', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    setMigrationFlag('useTest', 'shadow');

    const sharedResult = { value: 42 };
    const useHook = migrateHookToAzure(
      'useTest',
      () => ({ value: 42 }),
      () => ({ value: 42 }),
      'useTest',
    );
    useHook();

    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('does not log in supabase mode even if results differ', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    // default mode is 'supabase'

    const useHook = migrateHookToAzure(
      'useTest',
      () => 'a',
      () => 'b',
      'useTest',
    );
    useHook();

    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('does not log in azure mode even if results differ', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    setMigrationFlag('useTest', 'azure');

    const useHook = migrateHookToAzure(
      'useTest',
      () => 'a',
      () => 'b',
      'useTest',
    );
    useHook();

    expect(warnSpy).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// migrateHookToAzure — generic type preservation
// ---------------------------------------------------------------------------

describe('migrateHookToAzure — type preservation', () => {
  it('preserves complex return types', () => {
    interface HemsData {
      hospitals: string[];
      bases: string[];
      isLoading: boolean;
    }

    const sbData: HemsData = { hospitals: ['H1'], bases: ['B1'], isLoading: false };
    const azData: HemsData = { hospitals: ['H1'], bases: ['B1'], isLoading: false };

    const useHook = migrateHookToAzure<HemsData>(
      'useHemsData',
      () => sbData,
      () => azData,
      'useHemsData',
    );

    const result = useHook();
    expect(result.hospitals).toEqual(['H1']);
    expect(result.isLoading).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// migrateHookToAzure — dynamic flag switching
// ---------------------------------------------------------------------------

describe('migrateHookToAzure — dynamic flag switching', () => {
  it('responds to flag changes between calls', () => {
    const useHook = migrateHookToAzure(
      'useTest',
      () => 'supabase-result',
      () => 'azure-result',
      'useTest',
    );

    // Default: supabase
    expect(useHook()).toBe('supabase-result');

    // Switch to azure
    setMigrationFlag('useTest', 'azure');
    expect(useHook()).toBe('azure-result');

    // Switch to shadow (returns supabase)
    setMigrationFlag('useTest', 'shadow');
    expect(useHook()).toBe('supabase-result');

    // Clear flag (back to default supabase)
    clearMigrationFlag('useTest');
    expect(useHook()).toBe('supabase-result');
  });
});
