import { searchByKey, searchByValue } from './search';
import { EnvSnapshot } from './types';

const makeSnapshots = (): Record<string, EnvSnapshot> => ({
  dev: {
    name: 'dev',
    createdAt: new Date().toISOString(),
    env: {
      DATABASE_URL: 'postgres://localhost/dev',
      API_KEY: 'dev-key-123',
      DEBUG: 'true',
    },
  },
  prod: {
    name: 'prod',
    createdAt: new Date().toISOString(),
    env: {
      DATABASE_URL: 'postgres://prod-host/app',
      API_KEY: 'prod-secret-xyz',
      NODE_ENV: 'production',
    },
  },
});

describe('searchByKey', () => {
  it('finds snapshots with matching key', () => {
    const results = searchByKey(makeSnapshots(), 'api_key');
    expect(results).toHaveLength(2);
    expect(results.every(r => r.matchedKeys.includes('API_KEY'))).toBe(true);
  });

  it('returns empty when no match', () => {
    const results = searchByKey(makeSnapshots(), 'NONEXISTENT');
    expect(results).toHaveLength(0);
  });

  it('matches partial key names', () => {
    const results = searchByKey(makeSnapshots(), 'database');
    expect(results).toHaveLength(2);
    expect(results[0].matchedKeys).toContain('DATABASE_URL');
  });

  it('returns only snapshots with matching keys', () => {
    const results = searchByKey(makeSnapshots(), 'node_env');
    expect(results).toHaveLength(1);
    expect(results[0].snapshotName).toBe('prod');
  });
});

describe('searchByValue', () => {
  it('finds snapshots where value matches', () => {
    const results = searchByValue(makeSnapshots(), 'localhost');
    expect(results).toHaveLength(1);
    expect(results[0].snapshotName).toBe('dev');
  });

  it('matches partial values', () => {
    const results = searchByValue(makeSnapshots(), 'postgres');
    expect(results).toHaveLength(2);
  });

  it('returns empty when no value matches', () => {
    const results = searchByValue(makeSnapshots(), 'firebase');
    expect(results).toHaveLength(0);
  });
});
