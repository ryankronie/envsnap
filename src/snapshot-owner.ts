import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export const ownerFilePath = path.join(os.homedir(), '.envsnap', 'owners.json');

export interface OwnerRecord {
  owner: string;
  assignedAt: string;
}

export type OwnerMap = Record<string, OwnerRecord>;

export function loadOwners(): OwnerMap {
  if (!fs.existsSync(ownerFilePath)) return {};
  try {
    return JSON.parse(fs.readFileSync(ownerFilePath, 'utf-8')) as OwnerMap;
  } catch {
    return {};
  }
}

export function saveOwners(owners: OwnerMap): void {
  const dir = path.dirname(ownerFilePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(ownerFilePath, JSON.stringify(owners, null, 2), 'utf-8');
}

export function setOwner(snapshotName: string, owner: string): void {
  const owners = loadOwners();
  owners[snapshotName] = { owner, assignedAt: new Date().toISOString() };
  saveOwners(owners);
}

export function removeOwner(snapshotName: string): void {
  const owners = loadOwners();
  delete owners[snapshotName];
  saveOwners(owners);
}

export function getOwner(snapshotName: string): OwnerRecord | null {
  const owners = loadOwners();
  return owners[snapshotName] ?? null;
}

export function listOwners(): Array<{ snapshot: string } & OwnerRecord> {
  const owners = loadOwners();
  return Object.entries(owners).map(([snapshot, record]) => ({ snapshot, ...record }));
}
