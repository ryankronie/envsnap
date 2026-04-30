import * as fs from 'fs';
import {
  commentFilePath,
  setComment,
  getComment,
  removeComment,
  listComments,
} from './snapshot-comment';

function cleanup() {
  const file = commentFilePath();
  if (fs.existsSync(file)) fs.unlinkSync(file);
}

beforeEach(cleanup);
afterAll(cleanup);

describe('snapshot-comment integration', () => {
  it('full lifecycle: set, get, update, list, remove', () => {
    // Set
    setComment('snap-a', 'initial comment');
    expect(getComment('snap-a')?.text).toBe('initial comment');

    // Update preserves createdAt
    const first = getComment('snap-a')!;
    setComment('snap-a', 'updated comment');
    const second = getComment('snap-a')!;
    expect(second.text).toBe('updated comment');
    expect(second.createdAt).toBe(first.createdAt);

    // List includes snap-a
    setComment('snap-b', 'another');
    const all = listComments();
    expect(all.map((e) => e.name)).toContain('snap-a');
    expect(all.map((e) => e.name)).toContain('snap-b');

    // Remove
    expect(removeComment('snap-a')).toBe(true);
    expect(getComment('snap-a')).toBeUndefined();

    // snap-b still present
    expect(getComment('snap-b')?.text).toBe('another');
  });

  it('persists comments to disk', () => {
    setComment('persistent', 'disk test');
    const raw = JSON.parse(fs.readFileSync(commentFilePath(), 'utf-8'));
    expect(raw['persistent']).toBeDefined();
    expect(raw['persistent'].text).toBe('disk test');
  });
});
