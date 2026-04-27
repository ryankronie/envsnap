import * as fs from 'fs';
import * as path from 'path';
import { ensureSnapshotsDir } from './snapshot';

export interface AccessEntry {
  snapshot: string;
  accessedAt: string;
  action: 'read' | 'write' | 'delete';
}

export interface AccessLog {
  entries: AccessEntry[];
}

export function accessLogFilePath(): string {
  return path.join(ensureSnapshotsDir(), '.access-log.json');
}

export function loadAccessLog(): AccessLog {
  const filePath = accessLogFilePath();
  if (!fs.existsSync(filePath)) {
    return { entries: [] };
  }
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw) as AccessLog;
  } catch {
    return { entries: [] };
  }
}

export function saveAccessLog(log: AccessLog): void {
  const filePath = accessLogFilePath();
  fs.writeFileSync(filePath, JSON.stringify(log, null, 2), 'utf-8');
}

export function recordAccess(
  snapshot: string,
  action: AccessEntry['action']
): void {
  const log = loadAccessLog();
  log.entries.push({
    snapshot,
    accessedAt: new Date().toISOString(),
    action,
  });
  saveAccessLog(log);
}

export function getAccessHistory(snapshot: string): AccessEntry[] {
  const log = loadAccessLog();
  return log.entries.filter((e) => e.snapshot === snapshot);
}

export function clearAccessLog(): void {
  saveAccessLog({ entries: [] });
}

export function getRecentlyAccessed(limit = 10): AccessEntry[] {
  const log = loadAccessLog();
  return [...log.entries]
    .sort((a, b) => new Date(b.accessedAt).getTime() - new Date(a.accessedAt).getTime())
    .slice(0, limit);
}
