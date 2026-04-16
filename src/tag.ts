import * as fs from 'fs';
import * as path from 'path';

type TagMap = Record<string, string[]>;

const TAGS_FILE = 'tags.json';

export function loadTags(dir: string): TagMap {
  const file = path.join(dir, TAGS_FILE);
  if (!fs.existsSync(file)) return {};
  try {
    return JSON.parse(fs.readFileSync(file, 'utf-8')) as TagMap;
  } catch {
    return {};
  }
}

export function saveTags(dir: string, tags: TagMap): void {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, TAGS_FILE), JSON.stringify(tags, null, 2));
}

export function addTag(dir: string, snapshot: string, tag: string): void {
  const tags = loadTags(dir);
  if (!tags[snapshot]) tags[snapshot] = [];
  if (!tags[snapshot].includes(tag)) tags[snapshot].push(tag);
  saveTags(dir, tags);
}

export function removeTag(dir: string, snapshot: string, tag: string): void {
  const tags = loadTags(dir);
  if (!tags[snapshot]) return;
  tags[snapshot] = tags[snapshot].filter(t => t !== tag);
  if (tags[snapshot].length === 0) delete tags[snapshot];
  saveTags(dir, tags);
}

export function getTagsForSnapshot(dir: string, snapshot: string): string[] {
  const tags = loadTags(dir);
  return tags[snapshot] ?? [];
}

export function getSnapshotsForTag(dir: string, tag: string): string[] {
  const tags = loadTags(dir);
  return Object.entries(tags)
    .filter(([, tagList]) => tagList.includes(tag))
    .map(([snapshot]) => snapshot);
}

export function listAllTags(dir: string): string[] {
  const tags = loadTags(dir);
  const all = new Set<string>();
  Object.values(tags).forEach(list => list.forEach(t => all.add(t)));
  return Array.from(all).sort();
}
