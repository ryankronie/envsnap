import * as fs from 'fs';
import * as path from 'path';
import { ensureSnapshotsDir } from './snapshot';

export type PriorityLevel = 'low' | 'normal' | 'high' | 'critical';

export interface PriorityMap {
  [snapshotName: string]: PriorityLevel;
}

export function priorityFilePath(): string {
  return path.join(ensureSnapshotsDir(), '.priorities.json');
}

export function loadPriorities(): PriorityMap {
  const file = priorityFilePath();
  if (!fs.existsSync(file)) return {};
  return JSON.parse(fs.readFileSync(file, 'utf-8'));
}

export function savePriorities(map: PriorityMap): void {
  fs.writeFileSync(priorityFilePath(), JSON.stringify(map, null, 2));
}

export function setPriority(name: string, level: PriorityLevel): void {
  const map = loadPriorities();
  map[name] = level;
  savePriorities(map);
}

export function removePriority(name: string): void {
  const map = loadPriorities();
  delete map[name];
  savePriorities(map);
}

export function getPriority(name: string): PriorityLevel {
  const map = loadPriorities();
  return map[name] ?? 'normal';
}

export function listByPriority(level: PriorityLevel): string[] {
  const map = loadPriorities();
  return Object.entries(map)
    .filter(([, v]) => v === level)
    .map(([k]) => k);
}

export const PRIORITY_ORDER: Record<PriorityLevel, number> = {
  critical: 0,
  high: 1,
  normal: 2,
  low: 3,
};

export function sortByPriority(names: string[]): string[] {
  const map = loadPriorities();
  return [...names].sort((a, b) => {
    const pa = PRIORITY_ORDER[map[a] ?? 'normal'];
    const pb = PRIORITY_ORDER[map[b] ?? 'normal'];
    return pa - pb;
  });
}
