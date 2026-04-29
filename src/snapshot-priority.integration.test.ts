import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import {
  setPriority,
  getPriority,
  sortByPriority,
  listByPriority,
  removePriority,
} from './snapshot-priority';

const TEST_DIR = path.join(os.tmpdir(), 'envsnap-priority-int-' + Date.now());

jest.mock('./snapshot', () => ({
  ensureSnapshotsDir: () => TEST_DIR,
}));

beforeEach(() => fs.mkdirSync(TEST_DIR, { recursive: true }));
afterEach(() => fs.rmSync(TEST_DIR, { recursive: true }));

test('full lifecycle: set, get, list, sort, remove', () => {
  const snaps = ['alpha', 'beta', 'gamma', 'delta'];
  setPriority('alpha', 'low');
  setPriority('beta', 'critical');
  setPriority('gamma', 'high');
  // delta left unset => normal

  expect(getPriority('alpha')).toBe('low');
  expect(getPriority('beta')).toBe('critical');
  expect(getPriority('gamma')).toBe('high');
  expect(getPriority('delta')).toBe('normal');

  const sorted = sortByPriority(snaps);
  expect(sorted).toEqual(['beta', 'gamma', 'delta', 'alpha']);

  const criticals = listByPriority('critical');
  expect(criticals).toContain('beta');
  expect(criticals).not.toContain('alpha');

  removePriority('beta');
  expect(getPriority('beta')).toBe('normal');

  const sorted2 = sortByPriority(snaps);
  expect(sorted2[0]).toBe('gamma');
});
