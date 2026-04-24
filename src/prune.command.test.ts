import { Command } from 'commander';
import { registerPruneCommand } from './prune.command';
import * as pruneModule from './prune';

function makeProgram(): Command {
  const program = new Command();
  program.exitOverride();
  registerPruneCommand(program);
  return program;
}

describe('prune command', () => {
  let consoleSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;
  let pruneSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    pruneSpy = jest.spyOn(pruneModule, 'pruneSnapshots').mockResolvedValue([]);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('exits with error if no criteria provided', async () => {
    const program = makeProgram();
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    await expect(program.parseAsync(['node', 'envsnap', 'prune'])).rejects.toThrow();
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('--keep or --older-than'));
    exitSpy.mockRestore();
  });

  it('calls pruneSnapshots with keep option', async () => {
    const program = makeProgram();
    await program.parseAsync(['node', 'envsnap', 'prune', '--keep', '3']);
    expect(pruneSpy).toHaveBeenCalledWith(expect.objectContaining({ keep: 3 }));
  });

  it('calls pruneSnapshots with olderThanDays option', async () => {
    const program = makeProgram();
    await program.parseAsync(['node', 'envsnap', 'prune', '--older-than', '7']);
    expect(pruneSpy).toHaveBeenCalledWith(expect.objectContaining({ olderThanDays: 7 }));
  });

  it('prints removed snapshots', async () => {
    pruneSpy.mockResolvedValue(['snap-a', 'snap-b']);
    const program = makeProgram();
    await program.parseAsync(['node', 'envsnap', 'prune', '--keep', '1']);
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('2 snapshot(s)'));
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('snap-a'));
  });

  it('shows dry-run message without deleting', async () => {
    pruneSpy.mockResolvedValue(['snap-old']);
    const program = makeProgram();
    await program.parseAsync(['node', 'envsnap', 'prune', '--keep', '1', '--dry-run']);
    expect(pruneSpy).toHaveBeenCalledWith(expect.objectContaining({ dryRun: true }));
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Dry run'));
  });

  it('prints message when nothing matches', async () => {
    pruneSpy.mockResolvedValue([]);
    const program = makeProgram();
    await program.parseAsync(['node', 'envsnap', 'prune', '--keep', '10']);
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('No snapshots matched'));
  });
});
