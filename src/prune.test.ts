import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { pruneSnapshots } from './prune';
import { saveSnapshot, listSnapshots } from './snapshot';
import { pinSnapshot } from './pin';

const tmpDir = () => fs.mkdtempSync(path.join(os.tmpdir(), 'envsnap-prune-'));

function makeSnap(name: string, daysAgo: number) {
  const d = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
  return { name, env: { KEY: 'val' }, createdAt: d.toISOString() };
}

describe('pruneSnapshots', () => {
  let dir: string;

  beforeEach(() => {
    dir = tmpDir();
  });

  afterEach(() => {
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it('returns empty result when no snapshots exist', async () => {
    const result = await pruneSnapshots(dir, { keepLast: 3 });
    expect(result.removed).toHaveLength(0);
    expect(result.skipped).toHaveLength(0);
  });

  it('removes snapshots older than specified days', async () => {
    await saveSnapshot(dir, makeSnap('old-snap', 10));
    await saveSnapshot(dir, makeSnap('new-snap', 1));

    const result = await pruneSnapshots(dir, { olderThanDays: 5 });
    expect(result.removed).toContain('old-snap');
    expect(result.removed).not.toContain('new-snap');

    const remaining = await listSnapshots(dir);
    expect(remaining.map((s) => s.name)).not.toContain('old-snap');
  });

  it('keeps only the last N snapshots', async () => {
    await saveSnapshot(dir, makeSnap('snap-a', 5));
    await saveSnapshot(dir, makeSnap('snap-b', 3));
    await saveSnapshot(dir, makeSnap('snap-c', 1));

    const result = await pruneSnapshots(dir, { keepLast: 1 });
    expect(result.removed).toContain('snap-a');
    expect(result.removed).toContain('snap-b');
    expect(result.removed).not.toContain('snap-c');
  });

  it('does not remove pinned snapshots', async () => {
    await saveSnapshot(dir, makeSnap('pinned-snap', 20));
    await saveSnapshot(dir, makeSnap('other-snap', 20));
    await pinSnapshot(dir, 'pinned-snap');

    const result = await pruneSnapshots(dir, { olderThanDays: 5 });
    expect(result.skipped).toContain('pinned-snap');
    expect(result.removed).toContain('other-snap');
  });

  it('dry run does not delete files', async () => {
    await saveSnapshot(dir, makeSnap('snap-x', 15));

    const result = await pruneSnapshots(dir, { olderThanDays: 5, dryRun: true });
    expect(result.removed).toContain('snap-x');

    const remaining = await listSnapshots(dir);
    expect(remaining.map((s) => s.name)).toContain('snap-x');
  });
});
