import * as fs from 'fs';
import * as path from 'path';

export interface Snapshot {
  name: string;
  createdAt: string;
  env: Record<string, string>;
}

const SNAPSHOTS_DIR = path.join(process.cwd(), '.envsnap');

export function ensureSnapshotsDir(): void {
  if (!fs.existsSync(SNAPSHOTS_DIR)) {
    fs.mkdirSync(SNAPSHOTS_DIR, { recursive: true });
  }
}

export function saveSnapshot(name: string, env: Record<string, string>): Snapshot {
  ensureSnapshotsDir();

  const snapshot: Snapshot = {
    name,
    createdAt: new Date().toISOString(),
    env,
  };

  const filePath = path.join(SNAPSHOTS_DIR, `${name}.json`);
  fs.writeFileSync(filePath, JSON.stringify(snapshot, null, 2), 'utf-8');

  return snapshot;
}

export function loadSnapshot(name: string): Snapshot {
  const filePath = path.join(SNAPSHOTS_DIR, `${name}.json`);

  if (!fs.existsSync(filePath)) {
    throw new Error(`Snapshot "${name}" not found.`);
  }

  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw) as Snapshot;
}

export function listSnapshots(): Snapshot[] {
  ensureSnapshotsDir();

  const files = fs.readdirSync(SNAPSHOTS_DIR).filter(f => f.endsWith('.json'));

  return files.map(file => {
    const raw = fs.readFileSync(path.join(SNAPSHOTS_DIR, file), 'utf-8');
    return JSON.parse(raw) as Snapshot;
  });
}

export function deleteSnapshot(name: string): void {
  const filePath = path.join(SNAPSHOTS_DIR, `${name}.json`);

  if (!fs.existsSync(filePath)) {
    throw new Error(`Snapshot "${name}" not found.`);
  }

  fs.unlinkSync(filePath);
}
