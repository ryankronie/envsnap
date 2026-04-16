import { formatDiff, formatSummary } from './format';
import { DiffEntry } from './diff';

const entries: DiffEntry[] = [
  { key: 'NEW_KEY', status: 'added', newValue: 'hello' },
  { key: 'OLD_KEY', status: 'removed', oldValue: 'world' },
  { key: 'MOD_KEY', status: 'changed', oldValue: 'before', newValue: 'after' },
];

describe('formatDiff', () => {
  it('returns no-diff message for empty entries', () => {
    expect(formatDiff([])).toContain('No differences found');
  });

  it('includes + for added keys', () => {
    expect(formatDiff(entries, false)).toContain('+ NEW_KEY=hello');
  });

  it('includes - for removed keys', () => {
    expect(formatDiff(entries, false)).toContain('- OLD_KEY=world');
  });

  it('includes ~ for changed keys', () => {
    expect(formatDiff(entries, false)).toContain('~ MOD_KEY');
  });

  it('masks values when mask=true', () => {
    const output = formatDiff(entries, true);
    expect(output).not.toContain('hello');
    expect(output).not.toContain('world');
  });
});

describe('formatSummary', () => {
  it('shows correct counts', () => {
    const summary = formatSummary(entries);
    expect(summary).toContain('+1');
    expect(summary).toContain('-1');
    expect(summary).toContain('~1');
  });

  it('handles empty entries', () => {
    const summary = formatSummary([]);
    expect(summary).toContain('+0');
  });
});
