import * as fs from 'fs';
import * as path from 'path';
import { renameSnapshot, copySnapshot } from './rename';
import { saveSnapshot, listSnapshots, loadSnapshot } from './snapshot';

const TEST_DIR = '.envsnap-rename-test';

function cleanup() {
  if (fs.existsSync(TEST_DIR)) {
    fs.rmSync(TEST_DIR, { recursive: true });
  }
}

beforeEach(() => {
  cleanup();
  fs.mkdirSync(TEST_DIR, { recursive: true });
});

afterEach(cleanup);

describe('renameSnapshot', () => {
  it('renames an existing snapshot', () => {
    saveSnapshot('old', { FOO: 'bar' }, TEST_DIR);
    renameSnapshot('old', 'new', TEST_DIR);
    const names = listSnapshots(TEST_DIR);
    expect(names).toContain('new');
    expect(names).not.toContain('old');
  });

  it('preserves snapshot data after rename', () => {
    saveSnapshot('old', { FOO: 'bar', BAZ: 'qux' }, TEST_DIR);
    renameSnapshot('old', 'new', TEST_DIR);
    const data = loadSnapshot('new', TEST_DIR);
    expect(data).toEqual({ FOO: 'bar', BAZ: 'qux' });
  });

  it('throws if source snapshot does not exist', () => {
    expect(() => renameSnapshot('ghost', 'new', TEST_DIR)).toThrow(
      'Snapshot "ghost" does not exist.'
    );
  });

  it('throws if destination snapshot already exists', () => {
    saveSnapshot('alpha', { A: '1' }, TEST_DIR);
    saveSnapshot('beta', { B: '2' }, TEST_DIR);
    expect(() => renameSnapshot('alpha', 'beta', TEST_DIR)).toThrow(
      'Snapshot "beta" already exists.'
    );
  });
});

describe('copySnapshot', () => {
  it('copies snapshot to a new name', () => {
    saveSnapshot('source', { X: 'y' }, TEST_DIR);
    copySnapshot('source', 'dest', TEST_DIR);
    const names = listSnapshots(TEST_DIR);
    expect(names).toContain('source');
    expect(names).toContain('dest');
  });

  it('preserves snapshot data after copy', () => {
    saveSnapshot('source', { X: 'y', Z: 'w' }, TEST_DIR);
    copySnapshot('source', 'dest', TEST_DIR);
    const data = loadSnapshot('dest', TEST_DIR);
    expect(data).toEqual({ X: 'y', Z: 'w' });
  });

  it('throws if source does not exist', () => {
    expect(() => copySnapshot('missing', 'dest', TEST_DIR)).toThrow(
      'Snapshot "missing" does not exist.'
    );
  });

  it('throws if destination already exists', () => {
    saveSnapshot('src', { K: 'v' }, TEST_DIR);
    saveSnapshot('dst', { K: 'v' }, TEST_DIR);
    expect(() => copySnapshot('src', 'dst', TEST_DIR)).toThrow(
      'Snapshot "dst" already exists.'
    );
  });
});
