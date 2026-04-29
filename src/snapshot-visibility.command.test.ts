import { Command } from 'commander';
import * as fs from 'fs';
import { registerSnapshotVisibilityCommand } from './snapshot-visibility.command';
import { visibilityFilePath, setVisibility } from './snapshot-visibility';

function cleanup() {
  const p = visibilityFilePath();
  if (fs.existsSync(p)) fs.unlinkSync(p);
}

function makeProgram(): Command {
  const program = new Command();
  program.exitOverride();
  registerSnapshotVisibilityCommand(program);
  return program;
}

beforeEach(cleanup);
afterAll(cleanup);

describe('visibility set', () => {
  it('sets visibility and prints confirmation', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    makeProgram().parse(['visibility', 'set', 'mysnap', 'public'], { from: 'user' });
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('public'));
    spy.mockRestore();
  });

  it('exits on invalid visibility', () => {
    const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    expect(() =>
      makeProgram().parse(['visibility', 'set', 'mysnap', 'invisible'], { from: 'user' })
    ).toThrow('exit');
    errSpy.mockRestore();
    exitSpy.mockRestore();
  });
});

describe('visibility get', () => {
  it('prints the visibility of a snapshot', () => {
    setVisibility('mysnap', 'shared');
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    makeProgram().parse(['visibility', 'get', 'mysnap'], { from: 'user' });
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('shared'));
    spy.mockRestore();
  });
});

describe('visibility list', () => {
  it('lists snapshots by visibility', () => {
    setVisibility('snap1', 'public');
    setVisibility('snap2', 'public');
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    makeProgram().parse(['visibility', 'list', 'public'], { from: 'user' });
    expect(spy).toHaveBeenCalledTimes(2);
    spy.mockRestore();
  });

  it('prints message when no snapshots found', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    makeProgram().parse(['visibility', 'list', 'shared'], { from: 'user' });
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('No snapshots'));
    spy.mockRestore();
  });
});
