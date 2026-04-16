import { EnvMap } from './types';

export type MergeStrategy = 'ours' | 'theirs' | 'interactive';

export interface MergeResult {
  merged: EnvMap;
  conflicts: string[];
  added: string[];
  overwritten: string[];
}

/**
 * Merges two env maps. `base` is the current env, `incoming` is the snapshot being merged.
 * Strategy:
 *   'ours'    – keep base value on conflict
 *   'theirs'  – use incoming value on conflict
 */
export function mergeEnvs(
  base: EnvMap,
  incoming: EnvMap,
  strategy: Exclude<MergeStrategy, 'interactive'> = 'theirs'
): MergeResult {
  const merged: EnvMap = { ...base };
  const conflicts: string[] = [];
  const added: string[] = [];
  const overwritten: string[] = [];

  for (const [key, value] of Object.entries(incoming)) {
    if (!(key in base)) {
      merged[key] = value;
      added.push(key);
    } else if (base[key] !== value) {
      conflicts.push(key);
      if (strategy === 'theirs') {
        merged[key] = value;
        overwritten.push(key);
      }
      // 'ours' – leave base value, do nothing
    }
  }

  return { merged, conflicts, added, overwritten };
}

/**
 * Merges incoming into base, returning only the keys that would change.
 */
export function previewMerge(base: EnvMap, incoming: EnvMap): {
  toAdd: EnvMap;
  toOverwrite: EnvMap;
} {
  const toAdd: EnvMap = {};
  const toOverwrite: EnvMap = {};

  for (const [key, value] of Object.entries(incoming)) {
    if (!(key in base)) {
      toAdd[key] = value;
    } else if (base[key] !== value) {
      toOverwrite[key] = value;
    }
  }

  return { toAdd, toOverwrite };
}
