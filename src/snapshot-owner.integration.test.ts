import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import { setOwner, getOwner, removeOwner, listOwners } from './snapshot-owner';

let tmpDir: string;
let originalEnv: string | undefined;

beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'envsnap-owner-int-'));
  originalEnv = process.env.ENVSNAP_DIR;
  process.env.ENVSNAP_DIR = tmpDir;
});

afterEach(async () => {
  if (originalEnv === undefined) {
    delete process.env.ENVSNAP_DIR;
  } else {
    process.env.ENVSNAP_DIR = originalEnv;
  }
  await fs.rm(tmpDir, { recursive: true, force: true });
});

describe('snapshot-owner integration', () => {
  it('sets and retrieves an owner', async () => {
    await setOwner('mySnap', 'carol');
    const result = await getOwner('mySnap');
    expect(result).toBe('carol');
  });

  it('returns undefined for unknown snapshot', async () => {
    const result = await getOwner('ghost');
    expect(result).toBeUndefined();
  });

  it('removes an owner', async () => {
    await setOwner('mySnap', 'dave');
    await removeOwner('mySnap');
    const result = await getOwner('mySnap');
    expect(result).toBeUndefined();
  });

  it('lists all owners', async () => {
    await setOwner('snap1', 'alice');
    await setOwner('snap2', 'bob');
    const owners = await listOwners();
    expect(owners).toEqual({ snap1: 'alice', snap2: 'bob' });
  });

  it('overrides existing owner', async () => {
    await setOwner('snap1', 'alice');
    await setOwner('snap1', 'charlie');
    const result = await getOwner('snap1');
    expect(result).toBe('charlie');
  });
});
