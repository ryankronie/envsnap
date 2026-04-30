import * as fs from 'fs';
import * as path from 'path';

const SNAPSHOTS_DIR = path.join(process.cwd(), '.envsnap');

export const sourceFilePath = path.join(SNAPSHOTS_DIR, 'sources.json');

export interface SnapshotSource {
  snapshotName: string;
  source: string;
  importedAt: string;
}

export type SourceMap = Record<string, SnapshotSource>;

export function loadSources(): SourceMap {
  if (!fs.existsSync(sourceFilePath)) return {};
  try {
    return JSON.parse(fs.readFileSync(sourceFilePath, 'utf-8'));
  } catch {
    return {};
  }
}

export function saveSources(sources: SourceMap): void {
  if (!fs.existsSync(SNAPSHOTS_DIR)) {
    fs.mkdirSync(SNAPSHOTS_DIR, { recursive: true });
  }
  fs.writeFileSync(sourceFilePath, JSON.stringify(sources, null, 2));
}

export function setSource(snapshotName: string, source: string): SnapshotSource {
  const sources = loadSources();
  const entry: SnapshotSource = {
    snapshotName,
    source,
    importedAt: new Date().toISOString(),
  };
  sources[snapshotName] = entry;
  saveSources(sources);
  return entry;
}

export function removeSource(snapshotName: string): boolean {
  const sources = loadSources();
  if (!sources[snapshotName]) return false;
  delete sources[snapshotName];
  saveSources(sources);
  return true;
}

export function getSource(snapshotName: string): SnapshotSource | null {
  const sources = loadSources();
  return sources[snapshotName] ?? null;
}

export function listSources(): SnapshotSource[] {
  return Object.values(loadSources());
}
