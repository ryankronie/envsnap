import { loadSnapshot, saveSnapshot, listSnapshots } from './snapshot';
import { loadHistory, recordAction } from './history';
import { EnvSnapshot } from './types';

export interface RollbackResult {
  success: boolean;
  restoredName: string;
  previousVars: Record<string, string>;
  message: string;
}

export async function getLastSnapshot(projectName?: string): Promise<EnvSnapshot | null> {
  const snapshots = await listSnapshots();
  if (snapshots.length === 0) return null;

  const filtered = projectName
    ? snapshots.filter((s) => s.includes(projectName))
    : snapshots;

  if (filtered.length === 0) return null;

  const sorted = filtered.sort().reverse();
  return loadSnapshot(sorted[0]);
}

export async function rollbackSnapshot(
  targetName: string,
  currentName: string
): Promise<RollbackResult> {
  const target = await loadSnapshot(targetName);
  if (!target) {
    return {
      success: false,
      restoredName: targetName,
      previousVars: {},
      message: `Snapshot "${targetName}" not found.`,
    };
  }

  let previousVars: Record<string, string> = {};
  try {
    const current = await loadSnapshot(currentName);
    if (current) previousVars = current.vars;
  } catch {
    // no current snapshot — that's fine
  }

  const rollbackSnapshot: EnvSnapshot = {
    ...target,
    name: currentName,
    createdAt: new Date().toISOString(),
  };

  await saveSnapshot(rollbackSnapshot);
  await recordAction(currentName, 'rollback', { rolledBackTo: targetName });

  return {
    success: true,
    restoredName: targetName,
    previousVars,
    message: `Rolled back "${currentName}" to snapshot "${targetName}".`,
  };
}

export async function listRollbackTargets(currentName: string): Promise<string[]> {
  const history = await loadHistory();
  const relevant = history
    .filter((h) => h.snapshotName === currentName && h.action === 'rollback')
    .map((h) => (h.meta as Record<string, string>)?.rolledBackTo)
    .filter(Boolean) as string[];
  return [...new Set(relevant)];
}
