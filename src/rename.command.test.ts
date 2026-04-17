import { Command } from 'commander';
import { registerRenameCommand } from './rename.command';
import * as renameModule from './rename';

function makeProgram(): Command {
  const program = new Command();
  program.exitOverride();
  registerRenameCommand(program);
  return program;
}

describe('rename command', () => {
  afterEach(() => jest.restoreAllMocks());

  it('calls renameSnapshot and logs success', async () => {
    const spy = jest.spyOn(renameModule, 'renameSnapshot').mockResolvedValue(undefined);
    const logSpy = jest.spyOn(console, 'log').mockImplementation();
    const program = makeProgram();
    await program.parseAsync(['rename', 'old', 'new'], { from: 'user' });
    expect(spy).toHaveBeenCalledWith('old', 'new');
    expect(logSpy).toHaveBeenCalledWith('Snapshot "old" renamed to "new".');
  });

  it('logs error and exits if renameSnapshot throws', async () => {
    jest.spyOn(renameModule, 'renameSnapshot').mockRejectedValue(new Error('not found'));
    const errSpy = jest.spyOn(console, 'error').mockImplementation();
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    const program = makeProgram();
    await expect(program.parseAsync(['rename', 'a', 'b'], { from: 'user' })).rejects.toThrow('exit');
    expect(errSpy).toHaveBeenCalledWith('Error: not found');
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it('calls copySnapshot and logs success', async () => {
    const spy = jest.spyOn(renameModule, 'copySnapshot').mockResolvedValue(undefined);
    const logSpy = jest.spyOn(console, 'log').mockImplementation();
    const program = makeProgram();
    await program.parseAsync(['copy', 'src', 'dst'], { from: 'user' });
    expect(spy).toHaveBeenCalledWith('src', 'dst');
    expect(logSpy).toHaveBeenCalledWith('Snapshot "src" copied to "dst".');
  });

  it('logs error and exits if copySnapshot throws', async () => {
    jest.spyOn(renameModule, 'copySnapshot').mockRejectedValue(new Error('exists'));
    const errSpy = jest.spyOn(console, 'error').mockImplementation();
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    const program = makeProgram();
    await expect(program.parseAsync(['copy', 'a', 'b'], { from: 'user' })).rejects.toThrow('exit');
    expect(errSpy).toHaveBeenCalledWith('Error: exists');
    expect(exitSpy).toHaveBeenCalledWith(1);
  });
});
