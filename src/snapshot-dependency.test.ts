import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import {
  addDependency,
  removeDependency,
  getDependencies,
  getDependents,
  hasCycle,
  loadDependencies,
} from './snapshot-dependency';

const tmpDir = () => fs.mkdtempSync(path.join(os.tmpdir(), 'envsnap-dep-'));

describe('snapshot-dependency', () => {
  let dir: string;
  beforeEach(() => { dir = tmpDir(); });
  afterEach(() => { fs.rmSync(dir, { recursive: true, force: true }); });

  it('returns empty deps for unknown snapshot', () => {
    expect(getDependencies(dir, 'snap1')).toEqual([]);
  });

  it('adds a dependency', () => {
    addDependency(dir, 'snap1', 'snap2');
    expect(getDependencies(dir, 'snap1')).toContain('snap2');
  });

  it('does not duplicate dependencies', () => {
    addDependency(dir, 'snap1', 'snap2');
    addDependency(dir, 'snap1', 'snap2');
    expect(getDependencies(dir, 'snap1')).toHaveLength(1);
  });

  it('removes a dependency', () => {
    addDependency(dir, 'snap1', 'snap2');
    removeDependency(dir, 'snap1', 'snap2');
    expect(getDependencies(dir, 'snap1')).toHaveLength(0);
  });

  it('gets dependents', () => {
    addDependency(dir, 'snap1', 'snap3');
    addDependency(dir, 'snap2', 'snap3');
    expect(getDependents(dir, 'snap3')).toEqual(expect.arrayContaining(['snap1', 'snap2']));
  });

  it('detects no cycle when none exists', () => {
    addDependency(dir, 'snap1', 'snap2');
    expect(hasCycle(dir, 'snap1', 'snap2')).toBe(false);
  });

  it('detects a direct cycle', () => {
    addDependency(dir, 'snap1', 'snap2');
    expect(hasCycle(dir, 'snap2', 'snap1')).toBe(true);
  });

  it('detects a transitive cycle', () => {
    addDependency(dir, 'snap1', 'snap2');
    addDependency(dir, 'snap2', 'snap3');
    expect(hasCycle(dir, 'snap3', 'snap1')).toBe(true);
  });

  it('persists dependencies to disk', () => {
    addDependency(dir, 'snap1', 'snap2');
    const loaded = loadDependencies(dir);
    expect(loaded['snap1']).toContain('snap2');
  });
});
