import * as fs from 'fs/promises';
import * as path from 'path';

type OwnerMap = Record<string, string>;

function ownerFilePath(): string {
  const base = process.env.ENVSNAP_DIR ?? path.join(process.env.HOME ?? '.', '.envsnap');
  return path.join(base, 'owners.json');
}

export async function loadOwners(): Promise<OwnerMap> {
  try {
    const raw = await fs.readFile(ownerFilePath(), 'utf-8');
    return JSON.parse(raw) as OwnerMap;
  } catch {
    return {};
  }
}

export async function saveOwners(owners: OwnerMap): Promise<void> {
  const filePath = ownerFilePath();
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(owners, null, 2), 'utf-8');
}

export async function setOwner(snapshot: string, owner: string): Promise<void> {
  const owners = await loadOwners();
  owners[snapshot] = owner;
  await saveOwners(owners);
}

export async function removeOwner(snapshot: string): Promise<void> {
  const owners = await loadOwners();
  delete owners[snapshot];
  await saveOwners(owners);
}

export async function getOwner(snapshot: string): Promise<string | undefined> {
  const owners = await loadOwners();
  return owners[snapshot];
}

export async function listOwners(): Promise<OwnerMap> {
  return loadOwners();
}
