import * as fs from 'fs';
import * as path from 'path';
import { ensureSnapshotsDir } from './snapshot';

export type Visibility = 'public' | 'private' | 'shared';

export interface VisibilityEntry {
  visibility: Visibility;
  updatedAt: string;
}

export interface VisibilityMap {
  [snapshotName: string]: VisibilityEntry;
}

export function visibilityFilePath(): string {
  return path.join(ensureSnapshotsDir(), '.visibility.json');
}

export function loadVisibility(): VisibilityMap {
  const filePath = visibilityFilePath();
  if (!fs.existsSync(filePath)) return {};
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as VisibilityMap;
  } catch {
    return {};
  }
}

export function saveVisibility(map: VisibilityMap): void {
  fs.writeFileSync(visibilityFilePath(), JSON.stringify(map, null, 2));
}

export function setVisibility(snapshotName: string, visibility: Visibility): void {
  const map = loadVisibility();
  map[snapshotName] = { visibility, updatedAt: new Date().toISOString() };
  saveVisibility(map);
}

export function removeVisibility(snapshotName: string): void {
  const map = loadVisibility();
  delete map[snapshotName];
  saveVisibility(map);
}

export function getVisibility(snapshotName: string): Visibility {
  const map = loadVisibility();
  return map[snapshotName]?.visibility ?? 'private';
}

export function listByVisibility(visibility: Visibility): string[] {
  const map = loadVisibility();
  return Object.entries(map)
    .filter(([, entry]) => entry.visibility === visibility)
    .map(([name]) => name);
}
