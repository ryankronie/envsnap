import * as fs from 'fs';
import * as path from 'path';
import { ensureSnapshotsDir } from './snapshot';

const TAGS_FILE = () => path.join(ensureSnapshotsDir(), '.tags.json');

function loadTags(): Record<string, string[]> {
  const file = TAGS_FILE();
  if (!fs.existsSync(file)) return {};
  return JSON.parse(fs.readFileSync(file, 'utf-8'));
}

function saveTags(tags: Record<string, string[]>): void {
  fs.writeFileSync(TAGS_FILE(), JSON.stringify(tags, null, 2));
}

export function addTag(snapshotName: string, tag: string): void {
  const tags = loadTags();
  if (!tags[snapshotName]) tags[snapshotName] = [];
  if (!tags[snapshotName].includes(tag)) {
    tags[snapshotName].push(tag);
  }
  saveTags(tags);
}

export function removeTag(snapshotName: string, tag: string): void {
  const tags = loadTags();
  if (!tags[snapshotName]) return;
  tags[snapshotName] = tags[snapshotName].filter((t) => t !== tag);
  if (tags[snapshotName].length === 0) delete tags[snapshotName];
  saveTags(tags);
}

export function getTagsForSnapshot(snapshotName: string): string[] {
  return loadTags()[snapshotName] ?? [];
}

export function getSnapshotsByTag(tag: string): string[] {
  const tags = loadTags();
  return Object.entries(tags)
    .filter(([, t]) => t.includes(tag))
    .map(([name]) => name);
}

export function listAllTags(): string[] {
  const tags = loadTags();
  const all = new Set<string>();
  for (const t of Object.values(tags)) t.forEach((tag) => all.add(tag));
  return Array.from(all).sort();
}
