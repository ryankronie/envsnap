import * as fs from 'fs';
import * as path from 'path';
import { ensureSnapshotsDir } from './snapshot';

export interface SnapshotGroup {
  name: string;
  snapshots: string[];
  createdAt: string;
  description?: string;
}

export interface GroupsFile {
  groups: Record<string, SnapshotGroup>;
}

const groupsFile = path.join(ensureSnapshotsDir(), '.groups.json');

export function loadGroups(): GroupsFile {
  if (!fs.existsSync(groupsFile)) {
    return { groups: {} };
  }
  const raw = fs.readFileSync(groupsFile, 'utf-8');
  return JSON.parse(raw) as GroupsFile;
}

export function saveGroups(data: GroupsFile): void {
  fs.writeFileSync(groupsFile, JSON.stringify(data, null, 2));
}

export function createGroup(name: string, description?: string): SnapshotGroup {
  const data = loadGroups();
  if (data.groups[name]) {
    throw new Error(`Group "${name}" already exists`);
  }
  const group: SnapshotGroup = {
    name,
    snapshots: [],
    createdAt: new Date().toISOString(),
    description,
  };
  data.groups[name] = group;
  saveGroups(data);
  return group;
}

export function addSnapshotToGroup(groupName: string, snapshotName: string): void {
  const data = loadGroups();
  const group = data.groups[groupName];
  if (!group) throw new Error(`Group "${groupName}" not found`);
  if (!group.snapshots.includes(snapshotName)) {
    group.snapshots.push(snapshotName);
    saveGroups(data);
  }
}

export function removeSnapshotFromGroup(groupName: string, snapshotName: string): void {
  const data = loadGroups();
  const group = data.groups[groupName];
  if (!group) throw new Error(`Group "${groupName}" not found`);
  group.snapshots = group.snapshots.filter((s) => s !== snapshotName);
  saveGroups(data);
}

export function deleteGroup(name: string): void {
  const data = loadGroups();
  if (!data.groups[name]) throw new Error(`Group "${name}" not found`);
  delete data.groups[name];
  saveGroups(data);
}

export function listGroups(): SnapshotGroup[] {
  const data = loadGroups();
  return Object.values(data.groups);
}
