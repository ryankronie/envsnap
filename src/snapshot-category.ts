import * as fs from 'fs';
import * as path from 'path';
import { ensureSnapshotsDir } from './snapshot';

export interface CategoryMap {
  [snapshotName: string]: string;
}

export function categoryFilePath(): string {
  const dir = ensureSnapshotsDir();
  return path.join(dir, '.categories.json');
}

export function loadCategories(): CategoryMap {
  const file = categoryFilePath();
  if (!fs.existsSync(file)) return {};
  try {
    return JSON.parse(fs.readFileSync(file, 'utf-8'));
  } catch {
    return {};
  }
}

export function saveCategories(categories: CategoryMap): void {
  const file = categoryFilePath();
  fs.writeFileSync(file, JSON.stringify(categories, null, 2), 'utf-8');
}

export function setCategory(snapshotName: string, category: string): void {
  const categories = loadCategories();
  categories[snapshotName] = category;
  saveCategories(categories);
}

export function removeCategory(snapshotName: string): void {
  const categories = loadCategories();
  delete categories[snapshotName];
  saveCategories(categories);
}

export function getCategory(snapshotName: string): string | undefined {
  return loadCategories()[snapshotName];
}

export function listByCategory(category: string): string[] {
  const categories = loadCategories();
  return Object.entries(categories)
    .filter(([, cat]) => cat === category)
    .map(([name]) => name);
}

export function listAllCategories(): string[] {
  const categories = loadCategories();
  return [...new Set(Object.values(categories))].sort();
}
