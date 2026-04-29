import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import {
  statusFilePath,
  loadStatuses,
  setStatus,
  removeStatus,
  getStatus,
  listByStatus,
} from './snapshot-status';

const TEST_STATUS_FILE = path.join(os.homedir(), '.envsnap', 'status.json');

function cleanup() {
  if (fs.existsSync(TEST_STATUS_FILE)) fs.unlinkSync(TEST_STATUS_FILE);
}

beforeEach(cleanup);
afterAll(cleanup);

describe('statusFilePath', () => {
  it('returns the expected path', () => {
    expect(statusFilePath()).toBe(TEST_STATUS_FILE);
  });
});

describe('loadStatuses', () => {
  it('returns empty object when file does not exist', () => {
    expect(loadStatuses()).toEqual({});
  });
});

describe('setStatus', () => {
  it('saves a status entry for a snapshot', () => {
    const entry = setStatus('mysnap', 'active');
    expect(entry.snapshotName).toBe('mysnap');
    expect(entry.status).toBe('active');
    expect(entry.updatedAt).toBeTruthy();
  });

  it('overwrites an existing status', () => {
    setStatus('mysnap', 'draft');
    setStatus('mysnap', 'archived');
    expect(getStatus('mysnap')).toBe('archived');
  });
});

describe('getStatus', () => {
  it('returns null for unknown snapshot', () => {
    expect(getStatus('unknown')).toBeNull();
  });

  it('returns the correct status', () => {
    setStatus('snap1', 'deprecated');
    expect(getStatus('snap1')).toBe('deprecated');
  });
});

describe('removeStatus', () => {
  it('returns false when snapshot has no status', () => {
    expect(removeStatus('ghost')).toBe(false);
  });

  it('removes an existing status entry', () => {
    setStatus('snap2', 'active');
    expect(removeStatus('snap2')).toBe(true);
    expect(getStatus('snap2')).toBeNull();
  });
});

describe('listByStatus', () => {
  it('returns snapshots matching the given status', () => {
    setStatus('a', 'active');
    setStatus('b', 'archived');
    setStatus('c', 'active');
    const actives = listByStatus('active');
    expect(actives).toContain('a');
    expect(actives).toContain('c');
    expect(actives).not.toContain('b');
  });
});
