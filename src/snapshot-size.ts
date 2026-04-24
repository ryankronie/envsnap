import * as fs from 'fs';
import * as path from 'path';
import { Snapshot } from './types';
import { listSnapshots, loadSnapshot } from './snapshot';

export interface SnapshotSizeInfo {
  name: string;
  keyCount: number;
  byteSize: number;
  fileSizeBytes: number;
}

export interface SizeSummary {
  totalSnapshots: number;
  totalKeys: number;
  totalBytes: number;
  largest: SnapshotSizeInfo | null;
  smallest: SnapshotSizeInfo | null;
}

const SNAPSHOTS_DIR = path.resolve(process.env.ENVSNAP_DIR ?? '.envsnap', 'snapshots');

export function getSnapshotFilePath(name: string): string {
  return path.join(SNAPSHOTS_DIR, `${name}.json`);
}

export function measureSnapshot(name: string, snapshot: Snapshot): SnapshotSizeInfo {
  const envObj = snapshot.env ?? {};
  const keyCount = Object.keys(envObj).length;
  const serialized = JSON.stringify(envObj);
  const byteSize = Buffer.byteLength(serialized, 'utf8');

  let fileSizeBytes = 0;
  try {
    const filePath = getSnapshotFilePath(name);
    const stat = fs.statSync(filePath);
    fileSizeBytes = stat.size;
  } catch {
    fileSizeBytes = byteSize;
  }

  return { name, keyCount, byteSize, fileSizeBytes };
}

export function summarizeSizes(infos: SnapshotSizeInfo[]): SizeSummary {
  if (infos.length === 0) {
    return { totalSnapshots: 0, totalKeys: 0, totalBytes: 0, largest: null, smallest: null };
  }

  let totalKeys = 0;
  let totalBytes = 0;
  let largest = infos[0];
  let smallest = infos[0];

  for (const info of infos) {
    totalKeys += info.keyCount;
    totalBytes += info.fileSizeBytes;
    if (info.fileSizeBytes > largest.fileSizeBytes) largest = info;
    if (info.fileSizeBytes < smallest.fileSizeBytes) smallest = info;
  }

  return { totalSnapshots: infos.length, totalKeys, totalBytes, largest, smallest };
}

export async function getAllSnapshotSizes(): Promise<SnapshotSizeInfo[]> {
  const names = await listSnapshots();
  const results: SnapshotSizeInfo[] = [];

  for (const name of names) {
    try {
      const snapshot = await loadSnapshot(name);
      results.push(measureSnapshot(name, snapshot));
    } catch {
      // skip unreadable snapshots
    }
  }

  return results;
}
