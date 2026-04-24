import * as fs from 'fs';
import * as path from 'path';
import {
  loadProfiles, createProfile, addSnapshotToProfile,
  removeSnapshotFromProfile, deleteProfile, listProfiles
} from './profile';

const PROFILES_FILE = path.join(process.env.HOME || '.', '.envsnap', 'profiles.json');

function cleanup() {
  if (fs.existsSync(PROFILES_FILE)) fs.unlinkSync(PROFILES_FILE);
}

beforeEach(cleanup);
afterAll(cleanup);

describe('loadProfiles', () => {
  it('returns empty object when no file exists', () => {
    expect(loadProfiles()).toEqual({});
  });
});

describe('createProfile', () => {
  it('creates a new profile', () => {
    const p = createProfile('dev', 'Development env');
    expect(p.name).toBe('dev');
    expect(p.snapshots).toEqual([]);
    expect(p.description).toBe('Development env');
  });

  it('throws if profile already exists', () => {
    createProfile('staging');
    expect(() => createProfile('staging')).toThrow('already exists');
  });
});

describe('addSnapshotToProfile', () => {
  it('adds a snapshot to a profile', () => {
    createProfile('prod');
    addSnapshotToProfile('prod', 'snap-1');
    const profiles = loadProfiles();
    expect(profiles['prod'].snapshots).toContain('snap-1');
  });

  it('does not duplicate snapshots', () => {
    createProfile('prod2');
    addSnapshotToProfile('prod2', 'snap-1');
    addSnapshotToProfile('prod2', 'snap-1');
    expect(loadProfiles()['prod2'].snapshots).toHaveLength(1);
  });

  it('throws if profile not found', () => {
    expect(() => addSnapshotToProfile('missing', 'snap')).toThrow('not found');
  });
});

describe('removeSnapshotFromProfile', () => {
  it('removes a snapshot from a profile', () => {
    createProfile('test');
    addSnapshotToProfile('test', 'snap-x');
    removeSnapshotFromProfile('test', 'snap-x');
    expect(loadProfiles()['test'].snapshots).not.toContain('snap-x');
  });
});

describe('deleteProfile', () => {
  it('deletes a profile', () => {
    createProfile('temp');
    deleteProfile('temp');
    expect(loadProfiles()['temp']).toBeUndefined();
  });

  it('throws if profile not found', () => {
    expect(() => deleteProfile('ghost')).toThrow('not found');
  });
});

describe('listProfiles', () => {
  it('returns all profiles as array', () => {
    createProfile('a');
    createProfile('b');
    const names = listProfiles().map(p => p.name);
    expect(names).toContain('a');
    expect(names).toContain('b');
  });
});
