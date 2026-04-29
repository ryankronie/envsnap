import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const STATUS_FILE = path.join(os.homedir(), '.envsnap', 'status.json');

export type SnapshotStatus = 'active' | 'archived' | 'deprecated' | 'draft';

export interface StatusEntry {
  snapshotName: string;
  status: SnapshotStatus;
  updatedAt: string;
}

export type StatusMap = Record<string, StatusEntry>;

export function statusFilePath(): string {
  return STATUS_FILE;
}

export function loadStatuses(): StatusMap {
  if (!fs.existsSync(STATUS_FILE)) return {};
  try {
    return JSON.parse(fs.readFileSync(STATUS_FILE, 'utf-8'));
  } catch {
    return {};
  }
}

export function saveStatuses(statuses: StatusMap): void {
  const dir = path.dirname(STATUS_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(STATUS_FILE, JSON.stringify(statuses, null, 2));
}

export function setStatus(snapshotName: string, status: SnapshotStatus): StatusEntry {
  const statuses = loadStatuses();
  const entry: StatusEntry = {
    snapshotName,
    status,
    updatedAt: new Date().toISOString(),
  };
  statuses[snapshotName] = entry;
  saveStatuses(statuses);
  return entry;
}

export function removeStatus(snapshotName: string): boolean {
  const statuses = loadStatuses();
  if (!statuses[snapshotName]) return false;
  delete statuses[snapshotName];
  saveStatuses(statuses);
  return true;
}

export function getStatus(snapshotName: string): SnapshotStatus | null {
  const statuses = loadStatuses();
  return statuses[snapshotName]?.status ?? null;
}

export function listByStatus(status: SnapshotStatus): string[] {
  const statuses = loadStatuses();
  return Object.values(statuses)
    .filter((e) => e.status === status)
    .map((e) => e.snapshotName);
}
