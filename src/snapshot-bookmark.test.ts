import * as fs from 'fs';
import * as path from 'path';
import {
  addBookmark,
  removeBookmark,
  getBookmark,
  listBookmarks,
  resolveBookmark,
  bookmarkFilePath,
} from './snapshot-bookmark';

function cleanup() {
  const filePath = bookmarkFilePath();
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

beforeEach(cleanup);
afterAll(cleanup);

describe('addBookmark', () => {
  it('adds a new bookmark', () => {
    const bm = addBookmark('my-bm', 'snap-001', 'A test bookmark');
    expect(bm.name).toBe('my-bm');
    expect(bm.snapshotId).toBe('snap-001');
    expect(bm.description).toBe('A test bookmark');
    expect(bm.createdAt).toBeDefined();
  });

  it('throws if bookmark name already exists', () => {
    addBookmark('dup', 'snap-001');
    expect(() => addBookmark('dup', 'snap-002')).toThrow('already exists');
  });
});

describe('removeBookmark', () => {
  it('removes an existing bookmark', () => {
    addBookmark('to-remove', 'snap-010');
    removeBookmark('to-remove');
    expect(getBookmark('to-remove')).toBeUndefined();
  });

  it('throws if bookmark does not exist', () => {
    expect(() => removeBookmark('ghost')).toThrow('not found');
  });
});

describe('listBookmarks', () => {
  it('returns all bookmarks', () => {
    addBookmark('bm1', 'snap-1');
    addBookmark('bm2', 'snap-2');
    const list = listBookmarks();
    expect(list.length).toBe(2);
  });
});

describe('resolveBookmark', () => {
  it('resolves a bookmark name to snapshot id', () => {
    addBookmark('prod', 'snap-prod-42');
    expect(resolveBookmark('prod')).toBe('snap-prod-42');
  });

  it('returns the input if no bookmark found', () => {
    expect(resolveBookmark('raw-snap-id')).toBe('raw-snap-id');
  });
});
