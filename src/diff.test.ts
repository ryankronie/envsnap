import { diffEnvs, DiffEntry } from './diff';

describe('diffEnvs', () => {
  const base = { FOO: 'foo', BAR: 'bar', SHARED: 'same' };
  const target = { BAZ: 'baz', SHARED: 'same', FOO: 'changed' };

  let result: DiffEntry[];

  beforeAll(() => {
    result = diffEnvs(base, target);
  });

  it('detects removed keys', () => {
    const removed = result.find(d => d.key === 'BAR');
    expect(removed).toBeDefined();
    expect(removed?.status).toBe('removed');
    expect(removed?.oldValue).toBe('bar');
  });

  it('detects added keys', () => {
    const added = result.find(d => d.key === 'BAZ');
    expect(added).toBeDefined();
    expect(added?.status).toBe('added');
    expect(added?.newValue).toBe('baz');
  });

  it('detects changed keys', () => {
    const changed = result.find(d => d.key === 'FOO');
    expect(changed).toBeDefined();
    expect(changed?.status).toBe('changed');
    expect(changed?.oldValue).toBe('foo');
    expect(changed?.newValue).toBe('changed');
  });

  it('ignores unchanged keys', () => {
    const unchanged = result.find(d => d.key === 'SHARED');
    expect(unchanged).toBeUndefined();
  });

  it('returns sorted results', () => {
    const keys = result.map(d => d.key);
    expect(keys).toEqual([...keys].sort());
  });

  it('returns empty array for identical envs', () => {
    expect(diffEnvs({ A: '1' }, { A: '1' })).toHaveLength(0);
  });
});
