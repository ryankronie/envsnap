import { loadSnapshot } from './snapshot';

export interface DiffEntry {
  key: string;
  status: 'added' | 'removed' | 'changed';
  oldValue?: string;
  newValue?: string;
}

export function diffEnvs(
  base: Record<string, string>,
  target: Record<string, string>
): DiffEntry[] {
  const results: DiffEntry[] = [];
  const allKeys = new Set([...Object.keys(base), ...Object.keys(target)]);

  for (const key of allKeys) {
    const inBase = key in base;
    const inTarget = key in target;

    if (inBase && !inTarget) {
      results.push({ key, status: 'removed', oldValue: base[key] });
    } else if (!inBase && inTarget) {
      results.push({ key, status: 'added', newValue: target[key] });
    } else if (base[key] !== target[key]) {
      results.push({ key, status: 'changed', oldValue: base[key], newValue: target[key] });
    }
  }

  return results.sort((a, b) => a.key.localeCompare(b.key));
}

export async function diffSnapshots(
  project: string,
  nameA: string,
  nameB: string
): Promise<DiffEntry[]> {
  const snapshotA = await loadSnapshot(project, nameA);
  const snapshotB = await loadSnapshot(project, nameB);
  return diffEnvs(snapshotA.env, snapshotB.env);
}

export function diffWithCurrent(
  snapshot: Record<string, string>,
  current: Record<string, string> = process.env as Record<string, string>
): DiffEntry[] {
  return diffEnvs(snapshot, current);
}
