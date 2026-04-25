import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { setNote, getNote, removeNote, listNotes, loadNotes } from './snapshot-notes';

const TEST_DIR = path.join(os.tmpdir(), 'envsnap-notes-test-' + Date.now());

function cleanup() {
  if (fs.existsSync(TEST_DIR)) fs.rmSync(TEST_DIR, { recursive: true });
}

beforeEach(() => {
  process.env.ENVSNAP_DIR = TEST_DIR;
  fs.mkdirSync(TEST_DIR, { recursive: true });
});

afterEach(() => {
  cleanup();
  delete process.env.ENVSNAP_DIR;
});

describe('snapshot-notes', () => {
  it('returns empty object when no notes file exists', () => {
    expect(loadNotes()).toEqual({});
  });

  it('sets and retrieves a note', () => {
    setNote('my-snap', 'Initial production snapshot');
    expect(getNote('my-snap')).toBe('Initial production snapshot');
  });

  it('overwrites an existing note', () => {
    setNote('my-snap', 'first note');
    setNote('my-snap', 'updated note');
    expect(getNote('my-snap')).toBe('updated note');
  });

  it('returns undefined for unknown snapshot', () => {
    expect(getNote('nonexistent')).toBeUndefined();
  });

  it('removes a note and returns true', () => {
    setNote('snap-a', 'some note');
    const result = removeNote('snap-a');
    expect(result).toBe(true);
    expect(getNote('snap-a')).toBeUndefined();
  });

  it('returns false when removing a note that does not exist', () => {
    expect(removeNote('ghost')).toBe(false);
  });

  it('lists all notes', () => {
    setNote('snap-1', 'note one');
    setNote('snap-2', 'note two');
    const notes = listNotes();
    expect(notes).toHaveLength(2);
    expect(notes).toContainEqual({ snapshot: 'snap-1', note: 'note one' });
    expect(notes).toContainEqual({ snapshot: 'snap-2', note: 'note two' });
  });

  it('returns empty list when no notes exist', () => {
    expect(listNotes()).toEqual([]);
  });
});
