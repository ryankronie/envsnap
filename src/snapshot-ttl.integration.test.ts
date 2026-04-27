import * as fs from 'fs';
import * as path from 'path';
import { saveSnapshot } from './snapshot';
import { setTtl, removeTtl, getTtl, getExpiredSnapshots, parseTtlString } from './snapshot-ttl';

const TEST_DIR = path.join(__dirname, '../.test-ttl-integration');

beforeEach(() => {
  fs.mkdirSync(TEST_DIR, { recursive: true });
});

afterEach(() => {
  fs.rmSync(TEST_DIR, { recursive: true, force: true });
});

describe('snapshot-ttl integration', () => {
  it('full lifecycle: set, get, remove TTL', async () => {
    await saveSnapshot('snap1', { KEY: 'val' }, TEST_DIR);
    await setTtl('snap1', '2d', TEST_DIR);
    const ttl = await getTtl('snap1', TEST_DIR);
    expect(ttl).not.toBeNull();
    expect(ttl!.expiresAt).toBeGreaterThan(Date.now());
    await removeTtl('snap1', TEST_DIR);
    const ttlAfter = await getTtl('snap1', TEST_DIR);
    expect(ttlAfter).toBeNull();
  });

  it('detects expired snapshots', async () => {
    await saveSnapshot('expiredSnap', { X: '1' }, TEST_DIR);
    const pastMs = Date.now() - 1000;
    const ttlData = await import('./snapshot-ttl');
    const ttls = await ttlData.loadTtls(TEST_DIR);
    ttls['expiredSnap'] = { expiresAt: pastMs };
    await ttlData.saveTtls(ttls, TEST_DIR);
    const expired = await getExpiredSnapshots(TEST_DIR);
    expect(expired).toContain('expiredSnap');
  });

  it('parseTtlString parses various formats', () => {
    expect(parseTtlString('1d')).toBe(86400000);
    expect(parseTtlString('2h')).toBe(7200000);
    expect(parseTtlString('30m')).toBe(1800000);
    expect(() => parseTtlString('bad')).toThrow();
  });
});
