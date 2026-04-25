import * as fs from 'fs';
import * as path from 'path';
import { loadSnapshot, listSnapshots } from './snapshot';
import { Snapshot } from './types';

export interface SnapshotStats {
  name: string;
  keyCount: number;
  createdAt: string;
  hasEmptyValues: number;
  longestKey: string;
  longestValue: string;
}

export interface AggregateStats {
  totalSnapshots: number;
  totalKeys: number;
  averageKeys: number;
  mostKeys: { name: string; count: number };
  fewestKeys: { name: string; count: number };
}

export function computeSnapshotStats(name: string, snapshot: Snapshot): SnapshotStats {
  const entries = Object.entries(snapshot.env);
  const hasEmptyValues = entries.filter(([, v]) => v === '').length;

  let longestKey = '';
  let longestValue = '';
  for (const [k, v] of entries) {
    if (k.length > longestKey.length) longestKey = k;
    if (v.length > longestValue.length) longestValue = v;
  }

  return {
    name,
    keyCount: entries.length,
    createdAt: snapshot.createdAt,
    hasEmptyValues,
    longestKey,
    longestValue,
  };
}

export async function getStatsForSnapshot(name: string): Promise<SnapshotStats> {
  const snapshot = await loadSnapshot(name);
  return computeSnapshotStats(name, snapshot);
}

export async function getAggregateStats(): Promise<AggregateStats> {
  const names = await listSnapshots();
  if (names.length === 0) {
    return { totalSnapshots: 0, totalKeys: 0, averageKeys: 0, mostKeys: { name: '', count: 0 }, fewestKeys: { name: '', count: 0 } };
  }

  const allStats = await Promise.all(names.map(n => getStatsForSnapshot(n)));
  const totalKeys = allStats.reduce((sum, s) => sum + s.keyCount, 0);
  const sorted = [...allStats].sort((a, b) => a.keyCount - b.keyCount);

  return {
    totalSnapshots: names.length,
    totalKeys,
    averageKeys: Math.round(totalKeys / names.length),
    mostKeys: { name: sorted[sorted.length - 1].name, count: sorted[sorted.length - 1].keyCount },
    fewestKeys: { name: sorted[0].name, count: sorted[0].keyCount },
  };
}
