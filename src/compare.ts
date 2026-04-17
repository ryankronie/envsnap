import { loadSnapshot } from './snapshot';
import { diffEnvs } from './diff';
import { EnvSnapshot, EnvDiff } from './types';

export interface CompareResult {
  snapshotA: string;
  snapshotB: string;
  diff: EnvDiff;
  summary: {
    added: number;
    removed: number;
    changed: number;
    unchanged: number;
  };
}

export function buildSummary(diff: EnvDiff) {
  return {
    added: Object.keys(diff.added).length,
    removed: Object.keys(diff.removed).length,
    changed: Object.keys(diff.changed).length,
    unchanged: Object.keys(diff.unchanged).length,
  };
}

export async function compareSnapshots(
  nameA: string,
  nameB: string
): Promise<CompareResult> {
  const snapA: EnvSnapshot = await loadSnapshot(nameA);
  const snapB: EnvSnapshot = await loadSnapshot(nameB);

  const diff = diffEnvs(snapA.env, snapB.env);
  const summary = buildSummary(diff);

  return { snapshotA: nameA, snapshotB: nameB, diff, summary };
}
