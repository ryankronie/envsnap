import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { pruneSnapshots } from './prune';
import { saveSnapshot } from './snapshot';

const TEST_DIR = path.join(os.tmpdir(), 'envsnap-prune-integration');

function makeSnap(name: string, env: Record<string, string> = { KEY: 'val' }) {
  return saveSnapshot(name, env, TEST_DIR);
}

async function cleanup() {
  await fs.promises.rm(TEST_DIR, { recursive: true, force: true });
}

describe('prune integration', () => {
  beforeEach(async () => {
    await cleanup();
    await fs.promises.mkdir(TEST_DIR, { recursive: true });
  });

  afterEach(async () => {
    await cleanup();
  });

  it('prunes snapshots beyond keep count', async () => {
    await makeSnap('snap-1');
    await makeSnap('snap-2');
    await makeSnap('snap-3');

    const removed = await pruneSnapshots({ keep: 2, snapshotsDir: TEST_DIR });
    expect(removed).toHaveLength(1);

    const remaining = await fs.promises.readdir(TEST_DIR);
    expect(remaining).toHaveLength(2);
  });

  it('does not delete anything in dry-run mode', async () => {
    await makeSnap('snap-a');
    await makeSnap('snap-b');
    await makeSnap('snap-c');

    const removed = await pruneSnapshots({ keep: 1, dryRun: true, snapshotsDir: TEST_DIR });
    expect(removed).toHaveLength(2);

    const remaining = await fs.promises.readdir(TEST_DIR);
    expect(remaining).toHaveLength(3);
  });

  it('returns empty array when within keep limit', async () => {
    await makeSnap('only-one');
    const removed = await pruneSnapshots({ keep: 5, snapshotsDir: TEST_DIR });
    expect(removed).toHaveLength(0);
  });
});
