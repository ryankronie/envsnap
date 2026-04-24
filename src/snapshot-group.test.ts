import * as fs from 'fs';
import * as path from 'path';
import {
  loadGroups,
  createGroup,
  addSnapshotToGroup,
  removeSnapshotFromGroup,
  deleteGroup,
  listGroups,
} from './snapshot-group';
import { ensureSnapshotsDir } from './snapshot';

const groupsFilePath = path.join(ensureSnapshotsDir(), '.groups.json');

function cleanup() {
  if (fs.existsSync(groupsFilePath)) fs.unlinkSync(groupsFilePath);
}

beforeEach(cleanup);
afterAll(cleanup);

test('createGroup creates a new group', () => {
  const g = createGroup('mygroup', 'test group');
  expect(g.name).toBe('mygroup');
  expect(g.description).toBe('test group');
  expect(g.snapshots).toEqual([]);
});

test('createGroup throws if group already exists', () => {
  createGroup('dup');
  expect(() => createGroup('dup')).toThrow('already exists');
});

test('addSnapshotToGroup adds snapshot', () => {
  createGroup('g1');
  addSnapshotToGroup('g1', 'snap-a');
  const data = loadGroups();
  expect(data.groups['g1'].snapshots).toContain('snap-a');
});

test('addSnapshotToGroup does not duplicate', () => {
  createGroup('g2');
  addSnapshotToGroup('g2', 'snap-b');
  addSnapshotToGroup('g2', 'snap-b');
  const data = loadGroups();
  expect(data.groups['g2'].snapshots.length).toBe(1);
});

test('removeSnapshotFromGroup removes snapshot', () => {
  createGroup('g3');
  addSnapshotToGroup('g3', 'snap-c');
  removeSnapshotFromGroup('g3', 'snap-c');
  const data = loadGroups();
  expect(data.groups['g3'].snapshots).not.toContain('snap-c');
});

test('deleteGroup removes group', () => {
  createGroup('g4');
  deleteGroup('g4');
  const data = loadGroups();
  expect(data.groups['g4']).toBeUndefined();
});

test('listGroups returns all groups', () => {
  createGroup('ga');
  createGroup('gb');
  const groups = listGroups();
  const names = groups.map((g) => g.name);
  expect(names).toContain('ga');
  expect(names).toContain('gb');
});
