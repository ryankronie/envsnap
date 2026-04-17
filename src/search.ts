import { listSnapshots, loadSnapshot } from './snapshot';

export interface SearchResult {
  snapshotName: string;
  matches: Record<string, string>;
}

export function searchByKey(pattern: string): SearchResult[] {
  const regex = new RegExp(pattern, 'i');
  const results: SearchResult[] = [];

  for (const name of listSnapshots()) {
    const snapshot = loadSnapshot(name);
    const matches: Record<string, string> = {};
    for (const [key, value] of Object.entries(snapshot.env)) {
      if (regex.test(key)) {
        matches[key] = value;
      }
    }
    if (Object.keys(matches).length > 0) {
      results.push({ snapshotName: name, matches });
    }
  }

  return results;
}

export function searchByValue(pattern: string): SearchResult[] {
  const regex = new RegExp(pattern, 'i');
  const results: SearchResult[] = [];

  for (const name of listSnapshots()) {
    const snapshot = loadSnapshot(name);
    const matches: Record<string, string> = {};
    for (const [key, value] of Object.entries(snapshot.env)) {
      if (regex.test(value)) {
        matches[key] = value;
      }
    }
    if (Object.keys(matches).length > 0) {
      results.push({ snapshotName: name, matches });
    }
  }

  return results;
}
