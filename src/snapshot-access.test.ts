import * as fs from 'fs';
import * as path from 'path';
import {
  loadAccessLog,
  saveAccessLog,
  recordAccess,
  getAccessHistory,
  clearAccessLog,
  getRecentlyAccessed,
  accessLogFilePath,
} from './snapshot-access';

function cleanup() {
  const filePath = accessLogFilePath();
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
}

beforeEach(cleanup);
afterAll(cleanup);

describe('loadAccessLog', () => {
  it('returns empty log when file does not exist', () => {
    const log = loadAccessLog();
    expect(log.entries).toEqual([]);
  });
});

describe('saveAccessLog / loadAccessLog', () => {
  it('persists and reloads entries', () => {
    saveAccessLog({
      entries: [{ snapshot: 'snap1', accessedAt: '2024-01-01T00:00:00.000Z', action: 'read' }],
    });
    const log = loadAccessLog();
    expect(log.entries).toHaveLength(1);
    expect(log.entries[0].snapshot).toBe('snap1');
  });
});

describe('recordAccess', () => {
  it('appends a new access entry', () => {
    recordAccess('mysnap', 'write');
    recordAccess('mysnap', 'read');
    const log = loadAccessLog();
    expect(log.entries).toHaveLength(2);
    expect(log.entries[0].action).toBe('write');
    expect(log.entries[1].action).toBe('read');
  });
});

describe('getAccessHistory', () => {
  it('returns only entries for the given snapshot', () => {
    recordAccess('snap-a', 'read');
    recordAccess('snap-b', 'delete');
    recordAccess('snap-a', 'write');
    const history = getAccessHistory('snap-a');
    expect(history).toHaveLength(2);
    expect(history.every((e) => e.snapshot === 'snap-a')).toBe(true);
  });
});

describe('getRecentlyAccessed', () => {
  it('returns entries sorted by most recent first', () => {
    recordAccess('old', 'read');
    recordAccess('new', 'read');
    const recent = getRecentlyAccessed(2);
    expect(recent[0].snapshot).toBe('new');
    expect(recent[1].snapshot).toBe('old');
  });

  it('respects the limit parameter', () => {
    for (let i = 0; i < 5; i++) recordAccess(`snap-${i}`, 'read');
    const recent = getRecentlyAccessed(3);
    expect(recent).toHaveLength(3);
  });
});

describe('clearAccessLog', () => {
  it('removes all entries', () => {
    recordAccess('snap1', 'read');
    clearAccessLog();
    const log = loadAccessLog();
    expect(log.entries).toEqual([]);
  });
});
