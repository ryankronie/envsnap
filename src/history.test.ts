import * as fs from 'fs';
import * as path from 'path';
import { loadHistory, recordAction, getHistoryForSnapshot, clearHistory, HistoryEntry } from './history';

const HISTORY_FILE = '.envsnap/history.json';

function cleanup() {
  if (fs.existsSync(HISTORY_FILE)) {
    fs.unlinkSync(HISTORY_FILE);
  }
}

beforeEach(() => {
  cleanup();
});

afterAll(() => {
  cleanup();
});

describe('loadHistory', () => {
  it('returns empty array when no history exists', () => {
    const history = loadHistory();
    expect(history).toEqual([]);
  });
});

describe('recordAction', () => {
  it('records a save action', () => {
    recordAction('my-snap', 'save', ['FOO', 'BAR']);
    const history = loadHistory();
    expect(history).toHaveLength(1);
    expect(history[0].snapshotName).toBe('my-snap');
    expect(history[0].action).toBe('save');
    expect(history[0].keys).toEqual(['FOO', 'BAR']);
    expect(history[0].timestamp).toBeDefined();
  });

  it('records multiple actions', () => {
    recordAction('snap-a', 'save');
    recordAction('snap-a', 'restore');
    recordAction('snap-b', 'delete');
    const history = loadHistory();
    expect(history).toHaveLength(3);
  });
});

describe('getHistoryForSnapshot', () => {
  it('filters history by snapshot name', () => {
    recordAction('snap-a', 'save');
    recordAction('snap-b', 'save');
    recordAction('snap-a', 'restore');
    const entries = getHistoryForSnapshot('snap-a');
    expect(entries).toHaveLength(2);
    expect(entries.every((e: HistoryEntry) => e.snapshotName === 'snap-a')).toBe(true);
  });
});

describe('clearHistory', () => {
  it('removes all history entries', () => {
    recordAction('snap-a', 'save');
    clearHistory();
    expect(loadHistory()).toEqual([]);
  });
});
