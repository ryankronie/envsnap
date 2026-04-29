import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import {
  labelFilePath,
  loadLabels,
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

describe('loadLabels', () => {
  it('returns empty object when file missing', () => {
    expect(loadLabels()).toEqual({});
  });
});

describe('addLabel', () => {
  it('adds a label to a snapshot', () => {
    addLabel('snap1', 'production');
    expect(getLabels('snap1')).toContain('production');
  });

  it('does not duplicate labels', () => {
    addLabel('snap1', 'production');
    addLabel('snap1', 'production');
    expect(getLabels('snap1').filter((l) => l === 'production').length).toBe(1);
  });

  it('supports multiple labels per snapshot', () => {
    addLabel('snap1', 'production');
    addLabel('snap1', 'reviewed');
    expect(getLabels('snap1')).toEqual(['production', 'reviewed']);
  });
});

describe('removeLabel', () => {
  it('removes an existing label', () => {
    addLabel('snap1', 'staging');
    removeLabel('snap1', 'staging');
    expect(getLabels('snap1')).not.toContain('staging');
  });

  it('handles removing label from unknown snapshot gracefully', () => {
    expect(() => removeLabel('nonexistent', 'foo')).not.toThrow();
  });
});

describe('getSnapshotsByLabel', () => {
  it('returns snapshots matching a label', () => {
    addLabel('snap1', 'prod');
    addLabel('snap2', 'prod');
    addLabel('snap3', 'dev');
    expect(getSnapshotsByLabel('prod').sort()).toEqual(['snap1', 'snap2']);
  });
});

describe('clearLabels', () => {
  it('removes all labels for a snapshot', () => {
    addLabel('snap1', 'a');
    addLabel('snap1', 'b');
    clearLabels('snap1');
    expect(getLabels('snap1')).toEqual([]);
  });
});
