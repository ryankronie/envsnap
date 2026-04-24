import * as fs from 'fs';
import * as path from 'path';
import { listSnapshots, deleteSnapshot } from './snapshot';
import { loadPins } from './pin';
import { Snapshot } from './types';

export interface PruneOptions {
  keepLast?: number;
  olderThanDays?: number;
  dryRun?: boolean;
}

export interface PruneResult {
  removed: string[];
  skipped: string[];
  reason: Record<string, string>;
}

export async function pruneSnapshots(
  snapshotsDir: string,
  options: PruneOptions = {}
): Promise<PruneResult> {
  const { keepLast, olderThanDays, dryRun = false } = options;
  const result: PruneResult = { removed: [], skipped: [], reason: {} };

  const snapshots = await listSnapshots(snapshotsDir);
  if (snapshots.length === 0) return result;

  const pins = await loadPins(snapshotsDir);
  const pinnedSet = new Set(pins);

  // Sort by createdAt ascending (oldest first)
  const sorted = [...snapshots].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  const toRemove = new Set<string>();

  if (olderThanDays !== undefined) {
    const cutoff = Date.now() - olderThanDays * 24 * 60 * 60 * 1000;
    for (const snap of sorted) {
      if (new Date(snap.createdAt).getTime() < cutoff) {
        toRemove.add(snap.name);
        result.reason[snap.name] = `older than ${olderThanDays} day(s)`;
      }
    }
  }

  if (keepLast !== undefined && keepLast >= 0) {
    const unpinned = sorted.filter((s) => !pinnedSet.has(s.name));
    const excess = unpinned.slice(0, Math.max(0, unpinned.length - keepLast));
    for (const snap of excess) {
      toRemove.add(snap.name);
      result.reason[snap.name] = result.reason[snap.name]
        ? result.reason[snap.name] + '; exceeds keepLast limit'
        : 'exceeds keepLast limit';
    }
  }

  for (const name of toRemove) {
    if (pinnedSet.has(name)) {
      result.skipped.push(name);
      continue;
    }
    if (!dryRun) {
      await deleteSnapshot(snapshotsDir, name);
    }
    result.removed.push(name);
  }

  return result;
}
