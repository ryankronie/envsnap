import * as fs from 'fs';
import * as path from 'path';
import { ensureSnapshotsDir } from './snapshot';

const TTL_FILE = 'ttl.json';

export interface TtlEntry {
  snapshotName: string;
  expiresAt: number; // Unix timestamp in ms
}

export type TtlMap = Record<string, TtlEntry>;

export function ttlFilePath(): string {
  return path.join(ensureSnapshotsDir(), TTL_FILE);
}

export function loadTtls(): TtlMap {
  const file = ttlFilePath();
  if (!fs.existsSync(file)) return {};
  try {
    return JSON.parse(fs.readFileSync(file, 'utf-8')) as TtlMap;
  } catch {
    return {};
  }
}

export function saveTtls(ttls: TtlMap): void {
  fs.writeFileSync(ttlFilePath(), JSON.stringify(ttls, null, 2));
}

export function setTtl(snapshotName: string, ttlSeconds: number): TtlEntry {
  const ttls = loadTtls();
  const entry: TtlEntry = {
    snapshotName,
    expiresAt: Date.now() + ttlSeconds * 1000,
  };
  ttls[snapshotName] = entry;
  saveTtls(ttls);
  return entry;
}

export function removeTtl(snapshotName: string): boolean {
  const ttls = loadTtls();
  if (!ttls[snapshotName]) return false;
  delete ttls[snapshotName];
  saveTtls(ttls);
  return true;
}

export function getTtl(snapshotName: string): TtlEntry | null {
  const ttls = loadTtls();
  return ttls[snapshotName] ?? null;
}

export function isExpired(snapshotName: string): boolean {
  const entry = getTtl(snapshotName);
  if (!entry) return false;
  return Date.now() >= entry.expiresAt;
}

export function getExpiredSnapshots(): string[] {
  const ttls = loadTtls();
  const now = Date.now();
  return Object.values(ttls)
    .filter((e) => now >= e.expiresAt)
    .map((e) => e.snapshotName);
}
