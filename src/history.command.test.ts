import { Command } from 'commander';
import { registerHistoryCommand } from './history.command';
import * as historyModule from './history';
import { HistoryEntry } from './types';

function makeProgram(): Command {
  const program = new Command();
  program.exitOverride();
  registerHistoryCommand(program);
  return program;
}

const fakeEntry: HistoryEntry = { timestamp: 1700000000000, action: 'save', snapshotName: 'mysnap' };

describe('history command', () => {
  afterEach(() => jest.restoreAllMocks());

  it('lists all history entries', async () => {
    jest.spyOn(historyModule, 'loadHistory').mockResolvedValue([fakeEntry]);
    const logSpy = jest.spyOn(console, 'log').mockImplementation();
    const program = makeProgram();
    await program.parseAsync(['history', 'list'], { from: 'user' });
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('save -> mysnap'));
  });

  it('prints no history when empty', async () => {
    jest.spyOn(historyModule, 'loadHistory').mockResolvedValue([]);
    const logSpy = jest.spyOn(console, 'log').mockImplementation();
    const program = makeProgram();
    await program.parseAsync(['history', 'list'], { from: 'user' });
    expect(logSpy).toHaveBeenCalledWith('No history found.');
  });

  it('filters by snapshot name', async () => {
    jest.spyOn(historyModule, 'getHistoryForSnapshot').mockResolvedValue([fakeEntry]);
    const logSpy = jest.spyOn(console, 'log').mockImplementation();
    const program = makeProgram();
    await program.parseAsync(['history', 'list', '--name', 'mysnap'], { from: 'user' });
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('mysnap'));
  });

  it('clears history', async () => {
    const spy = jest.spyOn(historyModule, 'clearHistory').mockResolvedValue(undefined);
    const logSpy = jest.spyOn(console, 'log').mockImplementation();
    const program = makeProgram();
    await program.parseAsync(['history', 'clear'], { from: 'user' });
    expect(spy).toHaveBeenCalled();
    expect(logSpy).toHaveBeenCalledWith('History cleared.');
  });

  it('handles error in clear', async () => {
    jest.spyOn(historyModule, 'clearHistory').mockRejectedValue(new Error('disk error'));
    const errSpy = jest.spyOn(console, 'error').mockImplementation();
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    const program = makeProgram();
    await expect(program.parseAsync(['history', 'clear'], { from: 'user' })).rejects.toThrow('exit');
    expect(errSpy).toHaveBeenCalledWith('Error: disk error');
    expect(exitSpy).toHaveBeenCalledWith(1);
  });
});
