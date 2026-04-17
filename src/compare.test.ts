import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { saveSnapshot } from './snapshot';
import { compareSnapshots, buildSummary } from './compare';
import { EnvDiff } from './types';

const TEST_DIR = path.join(__dirname, '../.snapshots-test-compare');

beforeEach(() => {
  process.env.SNAPSHOTS_DIR = TEST_DIR;
});

afterEach(() => {
  if (fs.existsSync(TEST_DIR)) {
    fs.rmSync(TEST_DIR, { recursive: true });
  }
  delete process.env.SNAPSHOTS_DIR;
});

describe('buildSummary', () => {
  it('counts keys correctly', () => {
    const diff: EnvDiff = {
      added: { A: '1' },
      removed: { B: '2', C: '3' },
      changed: {},
      unchanged: { D: '4' },
    };
    const summary = buildSummary(diff);
    expect(summary.added).toBe(1);
    expect(summary.removed).toBe(2);
    expect(summary.changed).toBe(0);
    expect(summary.unchanged).toBe(1);
  });
});

describe('compareSnapshots', () => {
  it('returns diff between two snapshots', async () => {
    await saveSnapshot('snap-a', { FOO: 'bar', SHARED: 'same' });
    await saveSnapshot('snap-b', { BAZ: 'qux', SHARED: 'same' });

    const result = await compareSnapshots('snap-a', 'snap-b');
    expect(result.snapshotA).toBe('snap-a');
    expect(result.snapshotB).toBe('snap-b');
    expect(result.diff.added).toHaveProperty('BAZ');
    expect(result.diff.removed).toHaveProperty('FOO');
    expect(result.summary.unchanged).toBe(1);
  });

  it('throws if snapshot not found', async () => {
    await expect(compareSnapshots('missing-a', 'missing-b')).rejects.toThrow();
  });
});
