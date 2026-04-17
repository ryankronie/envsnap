import * as fs from 'fs';
import * as path from 'path';
import { addSchedule, removeSchedule, loadSchedule, getSchedulesForSnapshot } from './schedule';

const TEST_DIR = path.join(__dirname, '../.test-schedule');

beforeEach(() => fs.mkdirSync(TEST_DIR, { recursive: true }));
afterEach(() => fs.rmSync(TEST_DIR, { recursive: true, force: true }));

describe('schedule', () => {
  it('adds a schedule entry', () => {
    addSchedule(TEST_DIR, 'mysnap', '0 * * * *', 'save');
    const entries = loadSchedule(TEST_DIR);
    expect(entries).toHaveLength(1);
    expect(entries[0].snapshot).toBe('mysnap');
    expect(entries[0].cron).toBe('0 * * * *');
    expect(entries[0].action).toBe('save');
  });

  it('updates existing entry instead of duplicating', () => {
    addSchedule(TEST_DIR, 'mysnap', '0 * * * *', 'save');
    addSchedule(TEST_DIR, 'mysnap', '30 6 * * *', 'save');
    const entries = loadSchedule(TEST_DIR);
    expect(entries).toHaveLength(1);
    expect(entries[0].cron).toBe('30 6 * * *');
  });

  it('removes a schedule entry', () => {
    addSchedule(TEST_DIR, 'mysnap', '0 * * * *', 'save');
    const removed = removeSchedule(TEST_DIR, 'mysnap', 'save');
    expect(removed).toBe(true);
    expect(loadSchedule(TEST_DIR)).toHaveLength(0);
  });

  it('returns false when removing non-existent entry', () => {
    const removed = removeSchedule(TEST_DIR, 'ghost', 'restore');
    expect(removed).toBe(false);
  });

  it('gets schedules for a specific snapshot', () => {
    addSchedule(TEST_DIR, 'snap1', '0 * * * *', 'save');
    addSchedule(TEST_DIR, 'snap1', '0 12 * * *', 'restore');
    addSchedule(TEST_DIR, 'snap2', '0 8 * * *', 'save');
    const results = getSchedulesForSnapshot(TEST_DIR, 'snap1');
    expect(results).toHaveLength(2);
    expect(results.every(e => e.snapshot === 'snap1')).toBe(true);
  });
});
