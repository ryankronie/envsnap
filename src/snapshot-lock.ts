import * as fs from 'fs';
import * as path from 'path';
import { ensureSnapshotsDir } from './snapshot';

const LOCK_FILE = 'locks.json';

export interface LockEntry {
  snapshotName: string;
  lockedAt: string;
  reason?: string;
}

export type LockMap = Record<string, LockEntry>;

export function lockFilePath(): string {
  return path.join(ensureSnapshotsDir(), LOCK_FILE);
}

export function loadLocks(): LockMap {
  const fp = lockFilePath();
  if (!fs.existsSync(fp)) return {};
  return JSON.parse(fs.readFileSync(fp, 'utf-8'));
}

export function saveLocks(locks: LockMap): void {
  fs.writeFileSync(lockFilePath(), JSON.stringify(locks, null, 2));
}

export function lockSnapshot(name: string, reason?: string): void {
  const locks = loadLocks();
  locks[name] = { snapshotName: name, lockedAt: new Date().toISOString(), reason };
  saveLocks(locks);
}

export function unlockSnapshot(name: string): void {
  const locks = loadLocks();
  delete locks[name];
  saveLocks(locks);
}

export function isLocked(name: string): boolean {
  const locks = loadLocks();
  return name in locks;
}

export function getLockEntry(name: string): LockEntry | undefined {
  return loadLocks()[name];
}

export function listLocked(): LockEntry[] {
  return Object.values(loadLocks());
}
