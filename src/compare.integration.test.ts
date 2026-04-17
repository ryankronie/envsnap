import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { saveSnapshot } from './snapshot';
import { compareSnapshots } from './compare';

const TEST_DIR = path.join(__dirname, '../.snapshots-test-compare-int');

beforeEach(() => {
  process.env.SNAPSHOTS_DIR = TEST_DIR;
});

afterEach(() => {
  if (fs.existsSync(TEST_DIR)) {
    fs.rmSync(TEST_DIR, { recursive: true });
  }
  delete process.env.SNAPSHOTS_DIR;
});

describe('compare integration', () => {
  it('full round-trip: save two snapshots and compare', async () => {
    const envA = { DB_HOST: 'localhost', DB_PORT: '5432', SECRET: 'abc' };
    const envB = { DB_HOST: 'prod.db', DB_PORT: '5432', API_KEY: 'xyz' };

    await saveSnapshot('dev', envA);
    await saveSnapshot('prod', envB);

    const result = await compareSnapshots('dev', 'prod');

    expect(result.diff.changed).toHaveProperty('DB_HOST');
    expect(result.diff.unchanged).toHaveProperty('DB_PORT');
    expect(result.diff.removed).toHaveProperty('SECRET');
    expect(result.diff.added).toHaveProperty('API_KEY');
    expect(result.summary.changed).toBe(1);
    expect(result.summary.unchanged).toBe(1);
    expect(result.summary.added).toBe(1);
    expect(result.summary.removed).toBe(1);
  });
});
