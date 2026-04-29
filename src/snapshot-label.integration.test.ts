import * as fs from 'fs';
import {
  labelFilePath,
  addLabel,
  removeLabel,
  getLabels,
  getSnapshotsByLabel,
  clearLabels,
} from './snapshot-label';

function cleanup() {
  if (fs.existsSync(labelFilePath)) fs.unlinkSync(labelFilePath);
}

beforeEach(cleanup);
afterAll(cleanup);

describe('snapshot-label integration', () => {
  it('full lifecycle: add, list, find, remove, clear', () => {
    addLabel('snap-a', 'production');
    addLabel('snap-a', 'stable');
    addLabel('snap-b', 'production');

    expect(getLabels('snap-a')).toEqual(['production', 'stable']);
    expect(getSnapshotsByLabel('production').sort()).toEqual(['snap-a', 'snap-b']);

    removeLabel('snap-a', 'stable');
    expect(getLabels('snap-a')).toEqual(['production']);

    clearLabels('snap-a');
    expect(getLabels('snap-a')).toEqual([]);
    expect(getSnapshotsByLabel('production')).toEqual(['snap-b']);
  });

  it('persists labels across load calls', () => {
    addLabel('snap-c', 'archived');
    // Simulate fresh load by re-importing (same process, same file)
    const { loadLabels } = require('./snapshot-label');
    const data = loadLabels();
    expect(data['snap-c']).toContain('archived');
  });

  it('handles multiple snapshots with distinct labels', () => {
    addLabel('x', 'alpha');
    addLabel('y', 'beta');
    addLabel('z', 'alpha');

    expect(getSnapshotsByLabel('alpha').sort()).toEqual(['x', 'z']);
    expect(getSnapshotsByLabel('beta')).toEqual(['y']);
    expect(getSnapshotsByLabel('gamma')).toEqual([]);
  });
});
