import { EnvSnapshot } from './types';

export interface LintRule {
  name: string;
  check: (key: string, value: string) => string | null;
}

export interface LintResult {
  key: string;
  rule: string;
  message: string;
}

export const defaultRules: LintRule[] = [
  {
    name: 'no-empty-value',
    check: (key, value) =>
      value.trim() === '' ? `Key "${key}" has an empty value` : null,
  },
  {
    name: 'uppercase-key',
    check: (key) =>
      key !== key.toUpperCase() ? `Key "${key}" should be uppercase` : null,
  },
  {
    name: 'no-spaces-in-key',
    check: (key) =>
      /\s/.test(key) ? `Key "${key}" contains whitespace` : null,
  },
  {
    name: 'no-quotes-in-value',
    check: (key, value) =>
      /^["'].*["']$/.test(value)
        ? `Key "${key}" value appears to be wrapped in quotes`
        : null,
  },
  {
    name: 'no-localhost-in-value',
    check: (key, value) =>
      /localhost|127\.0\.0\.1/.test(value)
        ? `Key "${key}" references localhost — may not be suitable for production`
        : null,
  },
];

export function lintSnapshot(
  snapshot: EnvSnapshot,
  rules: LintRule[] = defaultRules
): LintResult[] {
  const results: LintResult[] = [];
  for (const [key, value] of Object.entries(snapshot.vars)) {
    for (const rule of rules) {
      const message = rule.check(key, value);
      if (message) {
        results.push({ key, rule: rule.name, message });
      }
    }
  }
  return results;
}
