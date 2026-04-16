import { loadSnapshot, listSnapshots } from './snapshot';
import { EnvSnapshot } from './types';

export interface SearchResult {
  snapshotName: string;
  matchedKeys: string[];
}

export function searchByKey(snapshots: Record<string, EnvSnapshot>, query: string): SearchResult[] {
  const results: SearchResult[] = [];
  const lower = query.toLowerCase();

  for (const [name, snapshot] of Object.entries(snapshots)) {
    const matchedKeys = Object.keys(snapshot.env).filter(k =>
      k.toLowerCase().includes(lower)
    );
    if (matchedKeys.length > 0) {
      results.push({ snapshotName: name, matchedKeys });
    }
  }

  return results;
}

export function searchByValue(snapshots: Record<string, EnvSnapshot>, query: string): SearchResult[] {
  const results: SearchResult[] = [];
  const lower = query.toLowerCase();

  for (const [name, snapshot] of Object.entries(snapshots)) {
    const matchedKeys = Object.keys(snapshot.env).filter(k =>
      snapshot.env[k].toLowerCase().includes(lower)
    );
    if (matchedKeys.length > 0) {
      results.push({ snapshotName: name, matchedKeys });
    }
  }

  return results;
}

export async function searchSnapshots(
  projectDir: string,
  query: string,
  mode: 'key' | 'value' = 'key'
): Promise<SearchResult[]> {
  const names = await listSnapshots(projectDir);
  const snapshots: Record<string, EnvSnapshot> = {};

  for (const name of names) {
    snapshots[name] = await loadSnapshot(projectDir, name);
  }

  return mode === 'key'
    ? searchByKey(snapshots, query)
    : searchByValue(snapshots, query);
}
