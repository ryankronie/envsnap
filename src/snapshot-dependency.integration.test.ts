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

const tmpDir = () => fs.mkdtempSync(path.join(os.tmpdir(), 'envsnap-dep-int-'));

describe('snapshot-dependency integration', () => {
  let dir: string;
  beforeEach(() => { dir = tmpDir(); });
  afterEach(() => { fs.rmSync(dir, { recursive: true, force: true }); });

  it('builds a multi-level dependency graph without cycles', () => {
    addDependency(dir, 'app', 'base');
    addDependency(dir, 'app', 'secrets');
    addDependency(dir, 'base', 'core');

    expect(getDependencies(dir, 'app')).toEqual(expect.arrayContaining(['base', 'secrets']));
    expect(getDependencies(dir, 'base')).toContain('core');
    expect(getDependents(dir, 'base')).toContain('app');
    expect(hasCycle(dir, 'core', 'app')).toBe(true);
    expect(hasCycle(dir, 'app', 'core')).toBe(false);
  });

  it('cleans up correctly after removals', () => {
    addDependency(dir, 'snap1', 'snap2');
    addDependency(dir, 'snap1', 'snap3');
    removeDependency(dir, 'snap1', 'snap2');

    const deps = getDependencies(dir, 'snap1');
    expect(deps).not.toContain('snap2');
    expect(deps).toContain('snap3');

    const raw = loadDependencies(dir);
    expect(raw['snap1']).toHaveLength(1);
  });
});
