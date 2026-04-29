import * as fs from 'fs';
import * as path from 'path';
import { ensureSnapshotsDir } from './snapshot';

const DEPENDENCY_FILE = 'dependencies.json';

export interface DependencyMap {
  [snapshot: string]: string[];
}

export function dependencyFilePath(snapshotsDir: string): string {
  return path.join(snapshotsDir, DEPENDENCY_FILE);
}

export function loadDependencies(snapshotsDir: string): DependencyMap {
  const filePath = dependencyFilePath(snapshotsDir);
  if (!fs.existsSync(filePath)) return {};
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

export function saveDependencies(snapshotsDir: string, deps: DependencyMap): void {
  ensureSnapshotsDir(snapshotsDir);
  fs.writeFileSync(dependencyFilePath(snapshotsDir), JSON.stringify(deps, null, 2));
}

export function addDependency(snapshotsDir: string, snapshot: string, dependsOn: string): void {
  const deps = loadDependencies(snapshotsDir);
  if (!deps[snapshot]) deps[snapshot] = [];
  if (!deps[snapshot].includes(dependsOn)) {
    deps[snapshot].push(dependsOn);
  }
  saveDependencies(snapshotsDir, deps);
}

export function removeDependency(snapshotsDir: string, snapshot: string, dependsOn: string): void {
  const deps = loadDependencies(snapshotsDir);
  if (!deps[snapshot]) return;
  deps[snapshot] = deps[snapshot].filter((d) => d !== dependsOn);
  if (deps[snapshot].length === 0) delete deps[snapshot];
  saveDependencies(snapshotsDir, deps);
}

export function getDependencies(snapshotsDir: string, snapshot: string): string[] {
  const deps = loadDependencies(snapshotsDir);
  return deps[snapshot] ?? [];
}

export function getDependents(snapshotsDir: string, snapshot: string): string[] {
  const deps = loadDependencies(snapshotsDir);
  return Object.entries(deps)
    .filter(([, depList]) => depList.includes(snapshot))
    .map(([name]) => name);
}

export function hasCycle(snapshotsDir: string, from: string, to: string): boolean {
  const deps = loadDependencies(snapshotsDir);
  const visited = new Set<string>();
  const stack = [to];
  while (stack.length > 0) {
    const current = stack.pop()!;
    if (current === from) return true;
    if (visited.has(current)) continue;
    visited.add(current);
    (deps[current] ?? []).forEach((d) => stack.push(d));
  }
  return false;
}
