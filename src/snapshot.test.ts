import * as fs from 'fs';
import * as path from 'path';
import {
  saveSnapshot,
  loadSnapshot,
  listSnapshots,
  deleteSnapshot,
  Snapshot,
} from './snapshot';

const SNAPSHOTS_DIR = path.join(process.cwd(), '.envsnap');

function cleanup() {
  if (fs.existsSync(SNAPSHOTS_DIR)) {
    fs.rmSync(SNAPSHOTS_DIR, { recursive: true, force: true });
  }
}

describe('snapshot module', () => {
  beforeEach(() => cleanup());
  afterAll(() => cleanup());

  test('saveSnapshot creates a JSON file with correct data', () => {
    const env = { NODE_ENV: 'development', PORT: '3000' };
    const snap = saveSnapshot('test-snap', env);

    expect(snap.name).toBe('test-snap');
    expect(snap.env).toEqual(env);
    expect(typeof snap.createdAt).toBe('string');

    const filePath = path.join(SNAPSHOTS_DIR, 'test-snap.json');
    expect(fs.existsSync(filePath)).toBe(true);
  });

  test('loadSnapshot returns the saved snapshot', () => {
    const env = { API_KEY: 'abc123' };
    saveSnapshot('load-test', env);

    const loaded = loadSnapshot('load-test');
    expect(loaded.name).toBe('load-test');
    expect(loaded.env).toEqual(env);
  });

  test('loadSnapshot throws if snapshot does not exist', () => {
    expect(() => loadSnapshot('nonexistent')).toThrow('Snapshot "nonexistent" not found.');
  });

  test('listSnapshots returns all saved snapshots', () => {
    saveSnapshot('snap-a', { FOO: 'bar' });
    saveSnapshot('snap-b', { BAZ: 'qux' });

    const list = listSnapshots();
    const names = list.map((s: Snapshot) => s.name).sort();
    expect(names).toEqual(['snap-a', 'snap-b']);
  });

  test('deleteSnapshot removes the snapshot file', () => {
    saveSnapshot('to-delete', { X: '1' });
    deleteSnapshot('to-delete');

    const filePath = path.join(SNAPSHOTS_DIR, 'to-delete.json');
    expect(fs.existsSync(filePath)).toBe(false);
  });

  test('deleteSnapshot throws if snapshot does not exist', () => {
    expect(() => deleteSnapshot('ghost')).toThrow('Snapshot "ghost" not found.');
  });
});
