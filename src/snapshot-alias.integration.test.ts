import fs from 'fs/promises';
import { setAlias, resolveAlias, removeAlias, listAliases, resolveOrPassthrough } from './snapshot-alias';
import { saveSnapshot, loadSnapshot } from './snapshot';

const TEST_DIR = '.envsnap-alias-integration-test';

beforeEach(async () => {
  process.env.ENVSNAP_DIR = TEST_DIR;
  await fs.rm(TEST_DIR, { recursive: true, force: true });
});

afterEach(async () => {
  await fs.rm(TEST_DIR, { recursive: true, force: true });
  delete process.env.ENVSNAP_DIR;
});

describe('alias + snapshot integration', () => {
  it('can save a snapshot and access it via alias', async () => {
    const env = { NODE_ENV: 'production', API_KEY: 'secret' };
    await saveSnapshot('prod-2024', env);
    await setAlias('prod', 'prod-2024');

    const resolved = await resolveAlias('prod');
    expect(resolved).toBe('prod-2024');

    const snap = await loadSnapshot(resolved!);
    expect(snap.envs).toEqual(env);
  });

  it('resolveOrPassthrough falls back to direct snapshot name', async () => {
    const env = { APP: 'myapp' };
    await saveSnapshot('direct-snap', env);

    const name = await resolveOrPassthrough('direct-snap');
    const snap = await loadSnapshot(name);
    expect(snap.envs).toEqual(env);
  });

  it('multiple aliases can point to same snapshot', async () => {
    await saveSnapshot('base-snap', { KEY: 'val' });
    await setAlias('a1', 'base-snap');
    await setAlias('a2', 'base-snap');

    const aliases = await listAliases();
    expect(aliases['a1']).toBe('base-snap');
    expect(aliases['a2']).toBe('base-snap');
  });

  it('removing alias does not delete the snapshot', async () => {
    await saveSnapshot('keep-snap', { X: '1' });
    await setAlias('temp', 'keep-snap');
    await removeAlias('temp');

    const snap = await loadSnapshot('keep-snap');
    expect(snap.envs).toEqual({ X: '1' });

    const aliases = await listAliases();
    expect(aliases['temp']).toBeUndefined();
  });
});
