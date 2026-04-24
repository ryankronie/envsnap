import { measureSnapshot, summarizeSizes, SnapshotSizeInfo } from './snapshot-size';
import { Snapshot } from './types';

function makeSnapshot(env: Record<string, string>): Snapshot {
  return { name: 'test', createdAt: new Date().toISOString(), env };
}

describe('measureSnapshot', () => {
  it('returns correct key count', () => {
    const snap = makeSnapshot({ FOO: 'bar', BAZ: 'qux' });
    const info = measureSnapshot('mysnap', snap);
    expect(info.keyCount).toBe(2);
  });

  it('returns correct byte size for env payload', () => {
    const env = { KEY: 'value' };
    const snap = makeSnapshot(env);
    const info = measureSnapshot('mysnap', snap);
    const expected = Buffer.byteLength(JSON.stringify(env), 'utf8');
    expect(info.byteSize).toBe(expected);
  });

  it('uses byteSize as fileSizeBytes when file does not exist', () => {
    const env = { A: '1', B: '2' };
    const snap = makeSnapshot(env);
    const info = measureSnapshot('nonexistent-snapshot-xyz', snap);
    expect(info.fileSizeBytes).toBe(info.byteSize);
  });

  it('returns name on the info object', () => {
    const snap = makeSnapshot({});
    const info = measureSnapshot('snapname', snap);
    expect(info.name).toBe('snapname');
  });

  it('handles empty env object', () => {
    const snap = makeSnapshot({});
    const info = measureSnapshot('empty', snap);
    expect(info.keyCount).toBe(0);
    expect(info.byteSize).toBe(Buffer.byteLength('{}', 'utf8'));
  });
});

describe('summarizeSizes', () => {
  it('returns zeroed summary for empty array', () => {
    const summary = summarizeSizes([]);
    expect(summary.totalSnapshots).toBe(0);
    expect(summary.totalKeys).toBe(0);
    expect(summary.totalBytes).toBe(0);
    expect(summary.largest).toBeNull();
    expect(summary.smallest).toBeNull();
  });

  it('correctly sums keys and bytes', () => {
    const infos: SnapshotSizeInfo[] = [
      { name: 'a', keyCount: 3, byteSize: 100, fileSizeBytes: 120 },
      { name: 'b', keyCount: 5, byteSize: 200, fileSizeBytes: 220 },
    ];
    const summary = summarizeSizes(infos);
    expect(summary.totalSnapshots).toBe(2);
    expect(summary.totalKeys).toBe(8);
    expect(summary.totalBytes).toBe(340);
  });

  it('identifies largest and smallest by fileSizeBytes', () => {
    const infos: SnapshotSizeInfo[] = [
      { name: 'small', keyCount: 1, byteSize: 10, fileSizeBytes: 10 },
      { name: 'big', keyCount: 10, byteSize: 500, fileSizeBytes: 500 },
      { name: 'mid', keyCount: 5, byteSize: 200, fileSizeBytes: 200 },
    ];
    const summary = summarizeSizes(infos);
    expect(summary.largest?.name).toBe('big');
    expect(summary.smallest?.name).toBe('small');
  });

  it('handles single entry', () => {
    const infos: SnapshotSizeInfo[] = [
      { name: 'only', keyCount: 2, byteSize: 50, fileSizeBytes: 55 },
    ];
    const summary = summarizeSizes(infos);
    expect(summary.largest?.name).toBe('only');
    expect(summary.smallest?.name).toBe('only');
  });
});
