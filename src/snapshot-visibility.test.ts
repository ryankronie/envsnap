import * as fs from 'fs';
import * as path from 'path';
import {
  visibilityFilePath,
  loadVisibility,
  saveVisibility,
  setVisibility,
  removeVisibility,
  getVisibility,
  listByVisibility,
} from './snapshot-visibility';

function cleanup() {
  const p = visibilityFilePath();
  if (fs.existsSync(p)) fs.unlinkSync(p);
}

beforeEach(cleanup);
afterAll(cleanup);

describe('loadVisibility', () => {
  it('returns empty object when file missing', () => {
    expect(loadVisibility()).toEqual({});
  });
});

describe('setVisibility / getVisibility', () => {
  it('sets and retrieves visibility', () => {
    setVisibility('snap1', 'public');
    expect(getVisibility('snap1')).toBe('public');
  });

  it('defaults to private for unknown snapshots', () => {
    expect(getVisibility('unknown')).toBe('private');
  });

  it('updates existing entry', () => {
    setVisibility('snap1', 'public');
    setVisibility('snap1', 'shared');
    expect(getVisibility('snap1')).toBe('shared');
  });
});

describe('removeVisibility', () => {
  it('removes entry and falls back to private', () => {
    setVisibility('snap1', 'shared');
    removeVisibility('snap1');
    expect(getVisibility('snap1')).toBe('private');
  });
});

describe('listByVisibility', () => {
  it('lists snapshots by visibility', () => {
    setVisibility('snap1', 'public');
    setVisibility('snap2', 'shared');
    setVisibility('snap3', 'public');
    expect(listByVisibility('public').sort()).toEqual(['snap1', 'snap3']);
    expect(listByVisibility('shared')).toEqual(['snap2']);
    expect(listByVisibility('private')).toEqual([]);
  });
});
