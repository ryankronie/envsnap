import * as fs from 'fs';
import * as path from 'path';
import {
  expiryFilePath,
  loadExpiry,
  setExpiry,
  removeExpiry,
  getExpiry,
  isExpired,
  listExpired,
} from './snapshot-expiry';

const snapshotsDir = '.envsnap';

function cleanup() {
  if (fs.existsSync(expiryFilePath)) fs.unlinkSync(expiryFilePath);
  if (fs.existsSync(snapshotsDir) && fs.readdirSync(snapshotsDir).length === 0) {
    fs.rmdirSync(snapshotsDir);
  }
}

beforeEach(cleanup);
afterAll(cleanup);

describe('loadExpiry', () => {
  it('returns empty object when file does not exist', () => {
    expect(loadExpiry()).toEqual({});
  });
});

describe('setExpiry / getExpiry', () => {
  it('stores and retrieves an expiry record', () => {
    const date = new Date('2030-01-01T00:00:00Z');
    setExpiry('snap1', date);
    const record = getExpiry('snap1');
    expect(record).toBeDefined();
    expect(record!.snapshotName).toBe('snap1');
    expect(record!.expiresAt).toBe(date.getTime());
  });
});

describe('removeExpiry', () => {
  it('removes an expiry record', () => {
    setExpiry('snap2', new Date('2030-06-01'));
    removeExpiry('snap2');
    expect(getExpiry('snap2')).toBeUndefined();
  });
});

describe('isExpired', () => {
  it('returns false when expiry is in the future', () => {
    setExpiry('snap3', new Date('2099-01-01'));
    expect(isExpired('snap3')).toBe(false);
  });

  it('returns true when expiry is in the past', () => {
    setExpiry('snap4', new Date('2000-01-01'));
    expect(isExpired('snap4')).toBe(true);
  });

  it('returns false when no expiry is set', () => {
    expect(isExpired('nonexistent')).toBe(false);
  });
});

describe('listExpired', () => {
  it('returns only expired snapshots', () => {
    setExpiry('old', new Date('2000-01-01'));
    setExpiry('future', new Date('2099-01-01'));
    const expired = listExpired();
    expect(expired.map(r => r.snapshotName)).toContain('old');
    expect(expired.map(r => r.snapshotName)).not.toContain('future');
  });
});
