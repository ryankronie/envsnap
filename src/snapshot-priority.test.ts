import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import {
  loadPriorities,
  savePriorities,
  setPriority,
  removePriority,
  getPriority,
  listByPriority,
  sortByPriority,
  priorityFilePath,
} from './snapshot-priority';

const TEST_DIR = path.join(os.tmpdir(), 'envsnap-priority-test-' + Date.now());

jest.mock('./snapshot', () => ({
  ensureSnapshotsDir: () => TEST_DIR,
}));

function cleanup() {
  if (fs.existsSync(TEST_DIR)) fs.rmSync(TEST_DIR, { recursive: true });
}

beforeEach(() => {
  fs.mkdirSync(TEST_DIR, { recursive: true });
});

afterEach(cleanup);

test('loadPriorities returns empty object when no file', () => {
  expect(loadPriorities()).toEqual({});
});

test('setPriority and getPriority roundtrip', () => {
  setPriority('snap-a', 'high');
  expect(getPriority('snap-a')).toBe('high');
});

test('getPriority defaults to normal', () => {
  expect(getPriority('nonexistent')).toBe('normal');
});

test('removePriority deletes entry', () => {
  setPriority('snap-b', 'low');
  removePriority('snap-b');
  expect(getPriority('snap-b')).toBe('normal');
});

test('listByPriority filters correctly', () => {
  setPriority('snap-c', 'critical');
  setPriority('snap-d', 'critical');
  setPriority('snap-e', 'high');
  const result = listByPriority('critical');
  expect(result).toContain('snap-c');
  expect(result).toContain('snap-d');
  expect(result).not.toContain('snap-e');
});

test('sortByPriority orders by priority level', () => {
  setPriority('snap-low', 'low');
  setPriority('snap-critical', 'critical');
  setPriority('snap-high', 'high');
  const sorted = sortByPriority(['snap-low', 'snap-critical', 'snap-high']);
  expect(sorted[0]).toBe('snap-critical');
  expect(sorted[1]).toBe('snap-high');
  expect(sorted[2]).toBe('snap-low');
});

test('sortByPriority treats unset snapshots as normal', () => {
  setPriority('snap-low', 'low');
  const sorted = sortByPriority(['snap-low', 'snap-unset']);
  expect(sorted[0]).toBe('snap-unset');
  expect(sorted[1]).toBe('snap-low');
});
