import { computeSnapshotStats, getAggregateStats, getStatsForSnapshot } from './snapshot-stats';
import { saveSnapshot, deleteSnapshot } from './snapshot';
import { Snapshot } from './types';

const makeSnap = (env: Record<string, string>): Snapshot => ({
  env,
  createdAt: new Date().toISOString(),
});

describe('computeSnapshotStats', () => {
  it('counts keys correctly', () => {
    const snap = makeSnap({ A: '1', B: '2', C: '' });
    const stats = computeSnapshotStats('test', snap);
    expect(stats.keyCount).toBe(3);
    expect(stats.hasEmptyValues).toBe(1);
    expect(stats.name).toBe('test');
  });

  it('finds longest key and value', () => {
    const snap = makeSnap({ SHORT: 'x', VERY_LONG_KEY_NAME: 'short', A: 'a_much_longer_value_here' });
    const stats = computeSnapshotStats('test', snap);
    expect(stats.longestKey).toBe('VERY_LONG_KEY_NAME');
    expect(stats.longestValue).toBe('a_much_longer_value_here');
  });

  it('handles empty env', () => {
    const snap = makeSnap({});
    const stats = computeSnapshotStats('empty', snap);
    expect(stats.keyCount).toBe(0);
    expect(stats.longestKey).toBe('');
    expect(stats.longestValue).toBe('');
  });
});

describe('getStatsForSnapshot', () => {
  const name = '__stats_test_snap__';
  afterEach(async () => { try { await deleteSnapshot(name); } catch {} });

  it('loads and computes stats from saved snapshot', async () => {
    await saveSnapshot(name, { FOO: 'bar', BAZ: '' });
    const stats = await getStatsForSnapshot(name);
    expect(stats.name).toBe(name);
    expect(stats.keyCount).toBe(2);
    expect(stats.hasEmptyValues).toBe(1);
  });
});

describe('getAggregateStats', () => {
  const names = ['__agg_a__', '__agg_b__'];
  afterEach(async () => { for (const n of names) { try { await deleteSnapshot(n); } catch {} } });

  it('returns aggregate stats across snapshots', async () => {
    await saveSnapshot(names[0], { A: '1', B: '2' });
    await saveSnapshot(names[1], { X: '9', Y: '8', Z: '7' });
    const stats = await getAggregateStats();
    expect(stats.totalSnapshots).toBeGreaterThanOrEqual(2);
    expect(stats.totalKeys).toBeGreaterThanOrEqual(5);
  });
});
