import * as fs from 'fs';
import * as path from 'path';
import {
  lockSnapshot,
  unlockSnapshot,
  isLocked,
  getLockEntry,
  listLocked,
  loadLocks,
  lockFilePath,
} from './snapshot-lock';

function cleanup() {
  const fp = lockFilePath();
  if (fs.existsSync(fp)) fs.unlinkSync(fp);
}

beforeEach(cleanup);
afterAll(cleanup);

describe('lockSnapshot', () => {
  it('marks a snapshot as locked', () => {
    lockSnapshot('prod');
    expect(isLocked('prod')).toBe(true);
  });

  it('stores optional reason', () => {
    lockSnapshot('staging', 'deployed');
    const entry = getLockEntry('staging');
    expect(entry?.reason).toBe('deployed');
  });

  it('records lockedAt timestamp', () => {
    lockSnapshot('dev');
    const entry = getLockEntry('dev');
    expect(entry?.lockedAt).toBeDefined();
  });
});

describe('unlockSnapshot', () => {
  it('removes the lock', () => {
    lockSnapshot('prod');
    unlockSnapshot('prod');
    expect(isLocked('prod')).toBe(false);
  });

  it('is a no-op if not locked', () => {
    expect(() => unlockSnapshot('nonexistent')).not.toThrow();
  });
});

describe('listLocked', () => {
  it('returns all locked entries', () => {
    lockSnapshot('a');
    lockSnapshot('b');
    const entries = listLocked();
    const names = entries.map((e) => e.snapshotName);
    expect(names).toContain('a');
    expect(names).toContain('b');
  });

  it('returns empty array when none locked', () => {
    expect(listLocked()).toEqual([]);
  });
});
