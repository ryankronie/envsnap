import * as fs from 'fs';
import {
  lockSnapshot,
  unlockSnapshot,
  isLocked,
  listLocked,
  lockFilePath,
} from './snapshot-lock';

function cleanup() {
  const fp = lockFilePath();
  if (fs.existsSync(fp)) fs.unlinkSync(fp);
}

beforeEach(cleanup);
afterAll(cleanup);

describe('snapshot-lock integration', () => {
  it('persists locks across load calls', () => {
    lockSnapshot('env-prod', 'do not touch');
    // Simulate a fresh load by re-importing (file-based persistence)
    const { loadLocks } = require('./snapshot-lock');
    const locks = loadLocks();
    expect(locks['env-prod']).toBeDefined();
    expect(locks['env-prod'].reason).toBe('do not touch');
  });

  it('full lock/unlock lifecycle', () => {
    lockSnapshot('env-staging');
    expect(isLocked('env-staging')).toBe(true);
    expect(listLocked().map((e) => e.snapshotName)).toContain('env-staging');

    unlockSnapshot('env-staging');
    expect(isLocked('env-staging')).toBe(false);
    expect(listLocked()).toHaveLength(0);
  });

  it('handles multiple locks independently', () => {
    lockSnapshot('snap-a');
    lockSnapshot('snap-b', 'critical');
    expect(isLocked('snap-a')).toBe(true);
    expect(isLocked('snap-b')).toBe(true);

    unlockSnapshot('snap-a');
    expect(isLocked('snap-a')).toBe(false);
    expect(isLocked('snap-b')).toBe(true);
  });
});
