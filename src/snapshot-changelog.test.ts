import * as fs from 'fs';
import * as path from 'path';
import {
  loadChangelog,
  saveChangelog,
  addChangelogEntry,
  getChangelog,
  clearChangelog,
  changelogFilePath,
} from './snapshot-changelog';

function cleanup() {
  const file = changelogFilePath();
  if (fs.existsSync(file)) fs.unlinkSync(file);
}

beforeEach(cleanup);
afterAll(cleanup);

describe('loadChangelog', () => {
  it('returns empty object when file does not exist', () => {
    expect(loadChangelog()).toEqual({});
  });

  it('returns parsed data when file exists', () => {
    const data = { snap1: [{ timestamp: 't', action: 'created', description: 'init' }] };
    fs.writeFileSync(changelogFilePath(), JSON.stringify(data));
    expect(loadChangelog()).toEqual(data);
  });
});

describe('addChangelogEntry', () => {
  it('adds an entry for a snapshot', () => {
    addChangelogEntry('mysnap', 'updated', 'changed DB_HOST');
    const entries = getChangelog('mysnap');
    expect(entries).toHaveLength(1);
    expect(entries[0].action).toBe('updated');
    expect(entries[0].description).toBe('changed DB_HOST');
    expect(entries[0].timestamp).toBeTruthy();
  });

  it('appends multiple entries', () => {
    addChangelogEntry('mysnap', 'created', 'initial');
    addChangelogEntry('mysnap', 'updated', 'second change');
    expect(getChangelog('mysnap')).toHaveLength(2);
  });
});

describe('getChangelog', () => {
  it('returns empty array for unknown snapshot', () => {
    expect(getChangelog('nonexistent')).toEqual([]);
  });
});

describe('clearChangelog', () => {
  it('removes entries for a snapshot', () => {
    addChangelogEntry('snap2', 'created', 'init');
    clearChangelog('snap2');
    expect(getChangelog('snap2')).toEqual([]);
  });

  it('does not affect other snapshots', () => {
    addChangelogEntry('snapA', 'created', 'init');
    addChangelogEntry('snapB', 'created', 'init');
    clearChangelog('snapA');
    expect(getChangelog('snapB')).toHaveLength(1);
  });
});
