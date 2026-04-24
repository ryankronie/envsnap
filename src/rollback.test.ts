import fs from 'fs/promises';
import path from 'path';
import { rollbackSnapshot, listRollbackTargets, getLastSnapshot } from './rollback';
import { saveSnapshot, listSnapshots } from './snapshot';
import { EnvSnapshot } from './types';

const TEST_DIR = path.join(__dirname, '../.test-snapshots-rollback');

function makeSnap(name: string, vars: Record<string, string>): EnvSnapshot {
  return { name, vars, createdAt: new Date().toISOString() };
}

beforeEach(async () => {
  process.env.ENVSNAP_DIR = TEST_DIR;
  await fs.mkdir(TEST_DIR, { recursive: true });
});

afterEach(async () => {
  delete process.env.ENVSNAP_DIR;
  await fs.rm(TEST_DIR, { recursive: true, force: true });
});

describe('rollbackSnapshot', () => {
  it('returns failure if target snapshot does not exist', async () => {
    const result = await rollbackSnapshot('nonexistent', 'current');
    expect(result.success).toBe(false);
    expect(result.message).toContain('not found');
  });

  it('rolls back to target and saves under current name', async () => {
    const target = makeSnap('v1', { FOO: 'bar' });
    await saveSnapshot(target);

    const result = await rollbackSnapshot('v1', 'active');
    expect(result.success).toBe(true);
    expect(result.message).toContain('v1');

    const snaps = await listSnapshots();
    expect(snaps).toContain('active');
  });

  it('captures previousVars from existing current snapshot', async () => {
    await saveSnapshot(makeSnap('current', { OLD: 'value' }));
    await saveSnapshot(makeSnap('v1', { NEW: 'value' }));

    const result = await rollbackSnapshot('v1', 'current');
    expect(result.previousVars).toEqual({ OLD: 'value' });
  });
});

describe('getLastSnapshot', () => {
  it('returns null when no snapshots exist', async () => {
    const result = await getLastSnapshot();
    expect(result).toBeNull();
  });

  it('returns most recent snapshot when available', async () => {
    await saveSnapshot(makeSnap('snap-a', { A: '1' }));
    await saveSnapshot(makeSnap('snap-b', { B: '2' }));
    const result = await getLastSnapshot();
    expect(result).not.toBeNull();
  });
});

describe('listRollbackTargets', () => {
  it('returns empty array when no rollback history exists', async () => {
    const targets = await listRollbackTargets('my-snap');
    expect(targets).toEqual([]);
  });
});
