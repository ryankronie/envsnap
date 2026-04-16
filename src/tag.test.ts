import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { loadTags, saveTags, addTag, removeTag, getTagsForSnapshot, getSnapshotsForTag } from './tag';

const TEST_DIR = path.join(process.cwd(), '.test-tags');

beforeEach(() => {
  if (!fs.existsSync(TEST_DIR)) fs.mkdirSync(TEST_DIR, { recursive: true });
  process.env.ENVSNAP_DIR = TEST_DIR;
});

afterEach(() => {
  fs.rmSync(TEST_DIR, { recursive: true, force: true });
  delete process.env.ENVSNAP_DIR;
});

describe('loadTags / saveTags', () => {
  it('returns empty map when no tags file exists', () => {
    const tags = loadTags(TEST_DIR);
    expect(tags).toEqual({});
  });

  it('round-trips tag data', () => {
    const data = { mysnap: ['prod', 'v1'] };
    saveTags(TEST_DIR, data);
    expect(loadTags(TEST_DIR)).toEqual(data);
  });
});

describe('addTag', () => {
  it('adds a tag to a snapshot', () => {
    addTag(TEST_DIR, 'snap1', 'production');
    expect(getTagsForSnapshot(TEST_DIR, 'snap1')).toContain('production');
  });

  it('does not duplicate tags', () => {
    addTag(TEST_DIR, 'snap1', 'production');
    addTag(TEST_DIR, 'snap1', 'production');
    expect(getTagsForSnapshot(TEST_DIR, 'snap1').filter(t => t === 'production').length).toBe(1);
  });
});

describe('removeTag', () => {
  it('removes an existing tag', () => {
    addTag(TEST_DIR, 'snap1', 'staging');
    removeTag(TEST_DIR, 'snap1', 'staging');
    expect(getTagsForSnapshot(TEST_DIR, 'snap1')).not.toContain('staging');
  });
});

describe('getSnapshotsForTag', () => {
  it('returns all snapshots with a given tag', () => {
    addTag(TEST_DIR, 'snap1', 'prod');
    addTag(TEST_DIR, 'snap2', 'prod');
    addTag(TEST_DIR, 'snap3', 'dev');
    expect(getSnapshotsForTag(TEST_DIR, 'prod')).toEqual(expect.arrayContaining(['snap1', 'snap2']));
    expect(getSnapshotsForTag(TEST_DIR, 'prod')).not.toContain('snap3');
  });
});
