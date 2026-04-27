import fs from 'fs/promises';
import path from 'path';
import { setAlias, removeAlias, resolveAlias, listAliases, resolveOrPassthrough, aliasFilePath } from './snapshot-alias';

const TEST_DIR = '.envsnap-alias-test';

beforeEach(async () => {
  process.env.ENVSNAP_DIR = TEST_DIR;
  await fs.rm(TEST_DIR, { recursive: true, force: true });
});

afterEach(async () => {
  await fs.rm(TEST_DIR, { recursive: true, force: true });
  delete process.env.ENVSNAP_DIR;
});

describe('setAlias / listAliases', () => {
  it('saves and retrieves an alias', async () => {
    await setAlias('prod', 'snapshot-2024');
    const aliases = await listAliases();
    expect(aliases['prod']).toBe('snapshot-2024');
  });

  it('overwrites an existing alias', async () => {
    await setAlias('prod', 'snapshot-old');
    await setAlias('prod', 'snapshot-new');
    const aliases = await listAliases();
    expect(aliases['prod']).toBe('snapshot-new');
  });
});

describe('removeAlias', () => {
  it('removes an existing alias', async () => {
    await setAlias('dev', 'snapshot-dev');
    await removeAlias('dev');
    const aliases = await listAliases();
    expect(aliases['dev']).toBeUndefined();
  });

  it('does not throw when alias does not exist', async () => {
    await expect(removeAlias('nonexistent')).resolves.toBeUndefined();
  });
});

describe('resolveAlias', () => {
  it('returns the target snapshot name', async () => {
    await setAlias('staging', 'snapshot-staging');
    const result = await resolveAlias('staging');
    expect(result).toBe('snapshot-staging');
  });

  it('returns null for unknown alias', async () => {
    const result = await resolveAlias('unknown');
    expect(result).toBeNull();
  });
});

describe('resolveOrPassthrough', () => {
  it('returns resolved alias when found', async () => {
    await setAlias('prod', 'snapshot-prod');
    const result = await resolveOrPassthrough('prod');
    expect(result).toBe('snapshot-prod');
  });

  it('returns original name when alias not found', async () => {
    const result = await resolveOrPassthrough('snapshot-direct');
    expect(result).toBe('snapshot-direct');
  });
});

describe('aliasFilePath', () => {
  it('uses ENVSNAP_DIR env variable', () => {
    expect(aliasFilePath()).toBe(path.join(TEST_DIR, 'aliases.json'));
  });
});
