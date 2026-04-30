import * as fs from 'fs';
import * as path from 'path';
import {
  loadSources,
  saveSources,
  setSource,
  removeSource,
  getSource,
  listSources,
  sourceFilePath,
} from './snapshot-source';

function cleanup() {
  if (fs.existsSync(sourceFilePath)) {
    fs.unlinkSync(sourceFilePath);
  }
}

beforeEach(cleanup);
afterAll(cleanup);

describe('loadSources', () => {
  it('returns empty object when file does not exist', () => {
    expect(loadSources()).toEqual({});
  });

  it('returns parsed sources when file exists', () => {
    const data = { snap1: { snapshotName: 'snap1', source: '.env', importedAt: '2024-01-01T00:00:00.000Z' } };
    fs.mkdirSync(path.dirname(sourceFilePath), { recursive: true });
    fs.writeFileSync(sourceFilePath, JSON.stringify(data));
    expect(loadSources()).toEqual(data);
  });
});

describe('setSource', () => {
  it('stores source entry for a snapshot', () => {
    const entry = setSource('mysnap', '.env.local');
    expect(entry.snapshotName).toBe('mysnap');
    expect(entry.source).toBe('.env.local');
    expect(entry.importedAt).toBeDefined();
    const loaded = loadSources();
    expect(loaded['mysnap']).toEqual(entry);
  });

  it('overwrites existing source entry', () => {
    setSource('mysnap', '.env');
    const updated = setSource('mysnap', '.env.production');
    expect(updated.source).toBe('.env.production');
    expect(Object.keys(loadSources())).toHaveLength(1);
  });
});

describe('getSource', () => {
  it('returns null when snapshot has no source', () => {
    expect(getSource('nonexistent')).toBeNull();
  });

  it('returns entry when source exists', () => {
    setSource('snap2', 'shell');
    const result = getSource('snap2');
    expect(result?.source).toBe('shell');
  });
});

describe('removeSource', () => {
  it('returns false when source does not exist', () => {
    expect(removeSource('ghost')).toBe(false);
  });

  it('removes existing source and returns true', () => {
    setSource('toRemove', '.env');
    expect(removeSource('toRemove')).toBe(true);
    expect(getSource('toRemove')).toBeNull();
  });
});

describe('listSources', () => {
  it('returns all source entries', () => {
    setSource('a', '.env');
    setSource('b', '.env.test');
    const list = listSources();
    expect(list.length).toBeGreaterThanOrEqual(2);
    expect(list.map(s => s.snapshotName)).toEqual(expect.arrayContaining(['a', 'b']));
  });
});
