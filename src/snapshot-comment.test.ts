import * as fs from 'fs';
import * as path from 'path';
import {
  commentFilePath,
  setComment,
  removeComment,
  getComment,
  listComments,
  loadComments,
} from './snapshot-comment';

function cleanup() {
  const file = commentFilePath();
  if (fs.existsSync(file)) fs.unlinkSync(file);
}

beforeEach(cleanup);
afterAll(cleanup);

describe('setComment', () => {
  it('adds a comment for a snapshot', () => {
    const entry = setComment('snap1', 'My first comment');
    expect(entry.text).toBe('My first comment');
    expect(entry.createdAt).toBe(entry.updatedAt);
  });

  it('updates an existing comment and preserves createdAt', () => {
    const first = setComment('snap1', 'original');
    const second = setComment('snap1', 'updated');
    expect(second.text).toBe('updated');
    expect(second.createdAt).toBe(first.createdAt);
    expect(second.updatedAt).not.toBe(first.updatedAt === second.updatedAt ? second.updatedAt : first.updatedAt);
  });
});

describe('getComment', () => {
  it('returns undefined for unknown snapshot', () => {
    expect(getComment('unknown')).toBeUndefined();
  });

  it('returns the comment entry', () => {
    setComment('snap2', 'hello');
    expect(getComment('snap2')?.text).toBe('hello');
  });
});

describe('removeComment', () => {
  it('returns false when no comment exists', () => {
    expect(removeComment('ghost')).toBe(false);
  });

  it('removes an existing comment', () => {
    setComment('snap3', 'to be removed');
    expect(removeComment('snap3')).toBe(true);
    expect(getComment('snap3')).toBeUndefined();
  });
});

describe('listComments', () => {
  it('returns all comments with their names', () => {
    setComment('a', 'alpha');
    setComment('b', 'beta');
    const list = listComments();
    const names = list.map((c) => c.name);
    expect(names).toContain('a');
    expect(names).toContain('b');
  });
});
