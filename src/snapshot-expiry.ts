import * as fs from 'fs';
import * as path from 'path';
import { ensureSnapshotsDir } from './snapshot';

export const expiryFilePath = path.join('.envsnap', 'expiry.json');

export interface ExpiryRecord {
  snapshotName: string;
  expiresAt: number; // Unix timestamp ms
}

export type ExpiryMap = Record<string, ExpiryRecord>;

export function loadExpiry(): ExpiryMap {
  ensureSnapshotsDir();
  if (!fs.existsSync(expiryFilePath)) return {};
  try {
    return JSON.parse(fs.readFileSync(expiryFilePath, 'utf-8'));
  } catch {
    return {};
  }
}

export function saveExpiry(map: ExpiryMap): void {
  ensureSnapshotsDir();
  fs.writeFileSync(expiryFilePath, JSON.stringify(map, null, 2));
}

export function setExpiry(snapshotName: string, expiresAt: Date): void {
  const map = loadExpiry();
  map[snapshotName] = { snapshotName, expiresAt: expiresAt.getTime() };
  saveExpiry(map);
}

export function removeExpiry(snapshotName: string): void {
  const map = loadExpiry();
  delete map[snapshotName];
  saveExpiry(map);
}

export function getExpiry(snapshotName: string): ExpiryRecord | undefined {
  return loadExpiry()[snapshotName];
}

export function isExpired(snapshotName: string, now: Date = new Date()): boolean {
  const record = getExpiry(snapshotName);
  if (!record) return false;
  return now.getTime() >= record.expiresAt;
}

export function listExpired(now: Date = new Date()): ExpiryRecord[] {
  const map = loadExpiry();
  return Object.values(map).filter(r => now.getTime() >= r.expiresAt);
}
