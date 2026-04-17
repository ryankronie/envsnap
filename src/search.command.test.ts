import { Command } from 'commander';
import { registerSearchCommand } from './search.command';
import * as search from './search';

function makeProgram(): Command {
  const program = new Command();
  program.exitOverride();
  registerSearchCommand(program);
  return program;
}

describe('search command', () => {
  let logSpy: jest.SpyInstance;

  beforeEach(() => {
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('search key prints no results message when empty', () => {
    jest.spyOn(search, 'searchByKey').mockReturnValue([]);
    makeProgram().parse(['search', 'key', 'MISSING'], { from: 'user' });
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('No snapshots found'));
  });

  it('search key prints matching snapshots', () => {
    jest.spyOn(search, 'searchByKey').mockReturnValue([
      { snapshotName: 'snap1', matches: { API_KEY: 'abc123' } }
    ]);
    makeProgram().parse(['search', 'key', 'API_KEY'], { from: 'user' });
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('snap1'));
  });

  it('search value prints no results message when empty', () => {
    jest.spyOn(search, 'searchByValue').mockReturnValue([]);
    makeProgram().parse(['search', 'value', 'ghost'], { from: 'user' });
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('No snapshots found'));
  });

  it('search value prints matching snapshots', () => {
    jest.spyOn(search, 'searchByValue').mockReturnValue([
      { snapshotName: 'snap2', matches: { DB_PASS: 'secret' } }
    ]);
    makeProgram().parse(['search', 'value', 'secret'], { from: 'user' });
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('snap2'));
  });

  it('passes --mask option to formatSummary', () => {
    jest.spyOn(search, 'searchByKey').mockReturnValue([
      { snapshotName: 'snap3', matches: { TOKEN: 'xyz' } }
    ]);
    makeProgram().parse(['search', 'key', 'TOKEN', '--mask'], { from: 'user' });
    expect(logSpy).toHaveBeenCalled();
  });
});
