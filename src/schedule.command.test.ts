import { Command } from 'commander';
import { registerScheduleCommand } from './schedule.command';
import { loadSchedule } from './schedule';
import * as fs from 'fs';
import * as path from 'path';

const TEST_DIR = path.join(__dirname, '../.test-schedule-cmd');

function makeProgram() {
  const program = new Command();
  program.exitOverride();
  registerScheduleCommand(program, TEST_DIR);
  return program;
}

beforeEach(() => fs.mkdirSync(TEST_DIR, { recursive: true }));
afterEach(() => fs.rmSync(TEST_DIR, { recursive: true, force: true }));

describe('schedule command', () => {
  it('adds a schedule via CLI', async () => {
    const program = makeProgram();
    await program.parseAsync(['node', 'test', 'schedule', 'mysnap', '0 * * * *']);
    const entries = loadSchedule(TEST_DIR);
    expect(entries).toHaveLength(1);
    expect(entries[0].snapshot).toBe('mysnap');
  });

  it('removes a schedule via CLI', async () => {
    const program = makeProgram();
    await program.parseAsync(['node', 'test', 'schedule', 'mysnap', '0 * * * *']);
    await program.parseAsync(['node', 'test', 'unschedule', 'mysnap']);
    expect(loadSchedule(TEST_DIR)).toHaveLength(0);
  });

  it('lists schedules via CLI', async () => {
    const program = makeProgram();
    await program.parseAsync(['node', 'test', 'schedule', 'snap1', '0 9 * * *']);
    await program.parseAsync(['node', 'test', 'schedule', 'snap2', '0 17 * * *']);
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    await program.parseAsync(['node', 'test', 'schedules']);
    expect(spy).toHaveBeenCalledTimes(2);
    spy.mockRestore();
  });

  it('shows message when no schedules found', async () => {
    const program = makeProgram();
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    await program.parseAsync(['node', 'test', 'schedules']);
    expect(spy).toHaveBeenCalledWith('No schedules found.');
    spy.mockRestore();
  });
});
