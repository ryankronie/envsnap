import { validateSnapshot, validateEnvObject } from './validate';

describe('validateSnapshot', () => {
  it('passes a valid snapshot', () => {
    const result = validateSnapshot({
      name: 'my-snapshot',
      env: { API_KEY: 'abc123', PORT: '3000' },
      createdAt: new Date().toISOString(),
    });
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('fails when name is empty', () => {
    const result = validateSnapshot({ name: '', env: {}, createdAt: new Date().toISOString() });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Snapshot name is required');
  });

  it('fails when name has invalid characters', () => {
    const result = validateSnapshot({ name: 'bad name!', env: {}, createdAt: new Date().toISOString() });
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toMatch(/alphanumeric/);
  });

  it('warns on non-conventional key names', () => {
    const result = validateSnapshot({
      name: 'snap',
      env: { 'my-key': 'value' },
      createdAt: new Date().toISOString(),
    });
    expect(result.warnings.some(w => w.includes('my-key'))).toBe(true);
  });

  it('fails when a value is null', () => {
    const result = validateSnapshot({
      name: 'snap',
      env: { BAD_KEY: null as unknown as string },
      createdAt: new Date().toISOString(),
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('BAD_KEY'))).toBe(true);
  });

  it('warns when createdAt is missing', () => {
    const result = validateSnapshot({ name: 'snap', env: {}, createdAt: '' });
    expect(result.warnings).toContain('Snapshot is missing a createdAt timestamp');
  });
});

describe('validateEnvObject', () => {
  it('validates a plain env object', () => {
    const result = validateEnvObject({ NODE_ENV: 'production' });
    expect(result.valid).toBe(true);
  });
});
