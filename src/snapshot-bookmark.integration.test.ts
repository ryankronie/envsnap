import * as fs from 'fs';
import {
  addBookmark,
  removeBookmark,
  listBookmarks,
  resolveBookmark,
  bookmarkFilePath,
} from './snapshot-bookmark';

function cleanup() {
  const fp = bookmarkFilePath();
  if (fs.existsSync(fp)) fs.unlinkSync(fp);
}

beforeEach(cleanup);
afterAll(cleanup);

describe('snapshot-bookmark integration', () => {
  it('full lifecycle: add, list, resolve, remove', () => {
    expect(listBookmarks()).toHaveLength(0);

    addBookmark('dev', 'snap-dev-001', 'Development snapshot');
    addBookmark('prod', 'snap-prod-099');

    const all = listBookmarks();
    expect(all).toHaveLength(2);

    expect(resolveBookmark('dev')).toBe('snap-dev-001');
    expect(resolveBookmark('prod')).toBe('snap-prod-099');
    expect(resolveBookmark('unknown-id')).toBe('unknown-id');

    removeBookmark('dev');
    expect(listBookmarks()).toHaveLength(1);
    expect(resolveBookmark('dev')).toBe('dev');
  });

  it('persists bookmarks across load calls', () => {
    addBookmark('persist-test', 'snap-persist-42', 'should persist');
    const reloaded = listBookmarks();
    expect(reloaded.find((b) => b.name === 'persist-test')).toBeDefined();
    expect(reloaded.find((b) => b.name === 'persist-test')?.description).toBe('should persist');
  });

  it('throws on duplicate add without affecting existing data', () => {
    addBookmark('stable', 'snap-stable-1');
    expect(() => addBookmark('stable', 'snap-stable-2')).toThrow();
    expect(resolveBookmark('stable')).toBe('snap-stable-1');
  });
});
