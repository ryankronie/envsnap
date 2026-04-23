import { mergeEnvs, previewMerge } from './merge';

describe('mergeEnvs', () => {
  const base = { FOO: 'foo', SHARED: 'base-value' };
  const incoming = { BAR: 'bar', SHARED: 'incoming-value' };

  it('adds keys present only in incoming', () => {
    const { merged, added } = mergeEnvs(base, incoming, 'theirs');
    expect(merged.BAR).toBe('bar');
    expect(added).toContain('BAR');
  });

  it('preserves keys present only in base', () => {
    const { merged } = mergeEnvs(base, incoming, 'theirs');
    expect(merged.FOO).toBe('foo');
  });

  it('reports conflicts', () => {
    const { conflicts } = mergeEnvs(base, incoming, 'theirs');
    expect(conflicts).toContain('SHARED');
  });

  it('strategy theirs overwrites on conflict', () => {
    const { merged, overwritten } = mergeEnvs(base, incoming, 'theirs');
    expect(merged.SHARED).toBe('incoming-value');
    expect(overwritten).toContain('SHARED');
  });

  it('strategy ours keeps base value on conflict', () => {
    const { merged, overwritten } = mergeEnvs(base, incoming, 'ours');
    expect(merged.SHARED).toBe('base-value');
    expect(overwritten).toHaveLength(0);
  });

  it('no conflicts when maps are identical', () => {
    const { conflicts } = mergeEnvs(base, base, 'theirs');
    expect(conflicts).toHaveLength(0);
  });

  it('returns empty added and overwritten when incoming is empty', () => {
    const { merged, added, overwritten } = mergeEnvs(base, {}, 'theirs');
    expect(merged).toEqual(base);
    expect(added).toHaveLength(0);
    expect(overwritten).toHaveLength(0);
  });

  it('returns empty added and overwritten when base is empty', () => {
    const { merged, added, overwritten } = mergeEnvs({}, incoming, 'theirs');
    expect(merged).toEqual(incoming);
    expect(added).toContain('BAR');
    expect(added).toContain('SHARED');
    expect(overwritten).toHaveLength(0);
  });
});

describe('previewMerge', () => {
  it('separates additions from overwrites', () => {
    const base = { A: '1', B: '2' };
    const incoming = { B: '99', C: '3' };
    const { toAdd, toOverwrite } = previewMerge(base, incoming);
    expect(toAdd).toEqual({ C: '3' });
    expect(toOverwrite).toEqual({ B: '99' });
  });

  it('returns empty maps when nothing changes', () => {
    const env = { X: 'x' };
    const { toAdd, toOverwrite } = previewMerge(env, env);
    expect(toAdd).toEqual({});
    expect(toOverwrite).toEqual({});
  });
});
