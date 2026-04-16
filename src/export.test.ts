import { formatAsDotenv, formatAsShell, formatAsJson, renderExport } from './export';
import { Env } from './types';

const sampleEnv: Env = {
  NODE_ENV: 'production',
  API_KEY: 'abc123',
  DB_URL: 'postgres://localhost/db',
};

describe('formatAsDotenv', () => {
  it('formats env as dotenv lines', () => {
    const result = formatAsDotenv(sampleEnv);
    expect(result).toContain('NODE_ENV=production');
    expect(result).toContain('API_KEY=abc123');
    expect(result).toContain('DB_URL=postgres://localhost/db');
  });

  it('ends with newline', () => {
    expect(formatAsDotenv(sampleEnv).endsWith('\n')).toBe(true);
  });
});

describe('formatAsShell', () => {
  it('wraps values in export statements', () => {
    const result = formatAsShell(sampleEnv);
    expect(result).toContain('export NODE_ENV="production"');
    expect(result).toContain('export API_KEY="abc123"');
  });

  it('escapes double quotes in values', () => {
    const env: Env = { MSG: 'say "hello"' };
    expect(formatAsShell(env)).toContain('say \\"hello\\"');
  });
});

describe('formatAsJson', () => {
  it('produces valid JSON', () => {
    const result = formatAsJson(sampleEnv);
    const parsed = JSON.parse(result);
    expect(parsed).toEqual(sampleEnv);
  });
});

describe('renderExport', () => {
  it('delegates to correct formatter', () => {
    expect(renderExport(sampleEnv, 'json')).toBe(formatAsJson(sampleEnv));
    expect(renderExport(sampleEnv, 'dotenv')).toBe(formatAsDotenv(sampleEnv));
    expect(renderExport(sampleEnv, 'shell')).toBe(formatAsShell(sampleEnv));
  });

  it('throws on unknown format', () => {
    expect(() => renderExport(sampleEnv, 'xml' as any)).toThrow();
  });
});
