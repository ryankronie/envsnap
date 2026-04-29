import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import {
  ownerFilePath,
  loadOwners,
  saveOwners,
  setOwner,
  removeOwner,
  getOwner,
  listOwners,
} from './snapshot-owner';

function cleanup() {
  if (fs.existsSync(ownerFilePath)) fs.unlinkSync(ownerFilePath);
}

beforeEach(cleanup);
afterAll(cleanup);

describe('loadOwners', () => {
  it('returns empty object when file does not exist', () => {
    expect(loadOwners()).toEqual({});
  });

  it('returns empty object on malformed JSON', () => {
    const dir = path.dirname(ownerFilePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(ownerFilePath, 'not-json', 'utf-8');
    expect(loadOwners()).toEqual({});
  });
});

describe('setOwner / getOwner', () => {
  it('sets and retrieves an owner', () => {
    setOwner('my-snap', 'alice');
    const record = getOwner('my-snap');
    expect(record).not.toBeNull();
    expect(record!.owner).toBe('alice');
    expect(record!.assignedAt).toBeDefined();
  });

  it('returns null for unknown snapshot', () => {
    expect(getOwner('ghost')).toBeNull();
  });

  it('overwrites existing owner', () => {
    setOwner('my-snap', 'alice');
    setOwner('my-snap', 'bob');
    expect(getOwner('my-snap')!.owner).toBe('bob');
  });
});

describe('removeOwner', () => {
  it('removes an existing owner entry', () => {
    setOwner('my-snap', 'alice');
    removeOwner('my-snap');
    expect(getOwner('my-snap')).toBeNull();
  });

  it('does not throw when removing non-existent entry', () => {
    expect(() => removeOwner('ghost')).not.toThrow();
  });
});

describe('listOwners', () => {
  it('returns all owner entries', () => {
    setOwner('snap-a', 'alice');
    setOwner('snap-b', 'bob');
    const list = listOwners();
    expect(list).toHaveLength(2);
    const names = list.map((e) => e.snapshot);
    expect(names).toContain('snap-a');
    expect(names).toContain('snap-b');
  });

  it('returns empty array when no owners set', () => {
    expect(listOwners()).toEqual([]);
  });
});
