import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

let snapshotsDir: string;

beforeEach(() => {
  snapshotsDir = fs.mkdtempSync(path.join(os.tmpdir(), 'envsnap-ttl-test-'));
  jest.resetModules();
  jest.doMock('./snapshot', () => ({
    ensureSnapshotsDir: () => snapshotsDir,
  }));
});

afterEach(() => {
  fs.rmSync(snapshotsDir, { recursive: true, force: true });
  jest.resetModules();
});

async function load() {
  return await import('./snapshot-ttl');
}

test('loadTtls returns empty object when no file', async () => {
  const { loadTtls } = await load();
  expect(loadTtls()).toEqual({});
});

test('setTtl persists an entry', async () => {
  const { setTtl, loadTtls } = await load();
  setTtl('mysnap', 3600);
  const ttls = loadTtls();
  expect(ttls['mysnap']).toBeDefined();
  expect(ttls['mysnap'].snapshotName).toBe('mysnap');
  expect(ttls['mysnap'].expiresAt).toBeGreaterThan(Date.now());
});

test('getTtl returns null for unknown snapshot', async () => {
  const { getTtl } = await load();
  expect(getTtl('nope')).toBeNull();
});

test('removeTtl removes an existing entry', async () => {
  const { setTtl, removeTtl, getTtl } = await load();
  setTtl('snap1', 3600);
  const removed = removeTtl('snap1');
  expect(removed).toBe(true);
  expect(getTtl('snap1')).toBeNull();
});

test('removeTtl returns false for non-existent entry', async () => {
  const { removeTtl } = await load();
  expect(removeTtl('ghost')).toBe(false);
});

test('isExpired returns false for future expiry', async () => {
  const { setTtl, isExpired } = await load();
  setTtl('future', 9999);
  expect(isExpired('future')).toBe(false);
});

test('isExpired returns true for past expiry', async () => {
  const { setTtl, isExpired } = await load();
  setTtl('past', -1);
  expect(isExpired('past')).toBe(true);
});

test('getExpiredSnapshots returns only expired names', async () => {
  const { setTtl, getExpiredSnapshots } = await load();
  setTtl('alive', 9999);
  setTtl('dead', -1);
  const expired = getExpiredSnapshots();
  expect(expired).toContain('dead');
  expect(expired).not.toContain('alive');
});
