import * as fs from 'fs';
import * as path from 'path';
import { ensureSnapshotsDir } from './snapshot';

export interface ChangelogEntry {
  timestamp: string;
  action: string;
  description: string;
}

export type ChangelogMap = Record<string, ChangelogEntry[]>;

export function changelogFilePath(): string {
  return path.join(ensureSnapshotsDir(), '.changelog.json');
}

export function loadChangelog(): ChangelogMap {
  const file = changelogFilePath();
  if (!fs.existsSync(file)) return {};
  try {
    return JSON.parse(fs.readFileSync(file, 'utf-8')) as ChangelogMap;
  } catch {
    return {};
  }
}

export function saveChangelog(data: ChangelogMap): void {
  fs.writeFileSync(changelogFilePath(), JSON.stringify(data, null, 2));
}

export function addChangelogEntry(
  snapshotName: string,
  action: string,
  description: string
): void {
  const data = loadChangelog();
  if (!data[snapshotName]) data[snapshotName] = [];
  data[snapshotName].push({
    timestamp: new Date().toISOString(),
    action,
    description,
  });
  saveChangelog(data);
}

export function getChangelog(snapshotName: string): ChangelogEntry[] {
  const data = loadChangelog();
  return data[snapshotName] ?? [];
}

export function clearChangelog(snapshotName: string): void {
  const data = loadChangelog();
  delete data[snapshotName];
  saveChangelog(data);
}
