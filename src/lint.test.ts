import { lintSnapshot, defaultRules, LintRule } from './lint';
import { EnvSnapshot } from './types';

function makeSnapshot(vars: Record<string, string>): EnvSnapshot {
  return { name: 'test', vars, createdAt: new Date().toISOString() };
}

describe('lintSnapshot', () => {
  it('returns no results for a clean snapshot', () => {
    const snap = makeSnapshot({ DATABASE_URL: 'postgres://prod/db', API_KEY: 'abc123' });
    const results = lintSnapshot(snap);
    expect(results).toHaveLength(0);
  });

  it('flags empty values', () => {
    const snap = makeSnapshot({ MY_VAR: '' });
    const results = lintSnapshot(snap);
    expect(results.some((r) => r.rule === 'no-empty-value')).toBe(true);
  });

  it('flags lowercase keys', () => {
    const snap = makeSnapshot({ myVar: 'value' });
    const results = lintSnapshot(snap);
    expect(results.some((r) => r.rule === 'uppercase-key')).toBe(true);
  });

  it('flags keys with spaces', () => {
    const snap = makeSnapshot({ 'MY VAR': 'value' });
    const results = lintSnapshot(snap);
    expect(results.some((r) => r.rule === 'no-spaces-in-key')).toBe(true);
  });

  it('flags values wrapped in quotes', () => {
    const snap = makeSnapshot({ MY_VAR: '"hello"' });
    const results = lintSnapshot(snap);
    expect(results.some((r) => r.rule === 'no-quotes-in-value')).toBe(true);
  });

  it('flags localhost references', () => {
    const snap = makeSnapshot({ DB_HOST: 'localhost:5432' });
    const results = lintSnapshot(snap);
    expect(results.some((r) => r.rule === 'no-localhost-in-value')).toBe(true);
  });

  it('supports custom rules', () => {
    const customRule: LintRule = {
      name: 'no-test-prefix',
      check: (key) => key.startsWith('TEST_') ? `Key "${key}" uses TEST_ prefix` : null,
    };
    const snap = makeSnapshot({ TEST_VAR: 'value' });
    const results = lintSnapshot(snap, [customRule]);
    expect(results).toHaveLength(1);
    expect(results[0].rule).toBe('no-test-prefix');
  });

  it('returns multiple violations for the same key', () => {
    const snap = makeSnapshot({ 'lower key': '' });
    const results = lintSnapshot(snap);
    const ruleNames = results.map((r) => r.rule);
    expect(ruleNames).toContain('no-empty-value');
    expect(ruleNames).toContain('uppercase-key');
    expect(ruleNames).toContain('no-spaces-in-key');
  });
});
