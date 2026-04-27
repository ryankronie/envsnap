import { Command } from 'commander';
import * as fs from 'fs';
import { registerSnapshotLockCommand } from './snapshot-lock.command';
import { lockFilePath, lockSnapshot } from './snapshot-lock';

function makeProgram() {
  const program = new Command();
  program.exitOverride();
  registerSnapshotLockCommand(program);
  return program;
}

function cleanup() {
  const fp = lockFilePath();
  if (fs.existsSync(fp)) fs.unlinkSync(fp);
}

beforeEach(cleanup);
afterAll(cleanup);

describe('lock add', () => {
  it('locks a snapshot and prints confirmation', async () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const program = makeProgram();
    await program.parseAsync(['node', 'test', 'lock', 'add', 'mysnap']);
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('locked'));
    spy.mockRestore();
  });

  it('warns if already locked', async () => {
    lockSnapshot('mysnap');
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const program = makeProgram();
    await program.parseAsync(['node', 'test', 'lock', 'add', 'mysnap']);
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('already locked'));
    spy.mockRestore();
  });
});

describe('lock remove', () => {
  it('unlocks a snapshot', async () => {
    lockSnapshot('snap2');
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const program = makeProgram();
    await program.parseAsync(['node', 'test', 'lock', 'remove', 'snap2']);
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('unlocked'));
    spy.mockRestore();
  });
});

describe('lock list', () => {
  it('shows no locked message when empty', async () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const program = makeProgram();
    await program.parseAsync(['node', 'test', 'lock', 'list']);
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('No snapshots'));
    spy.mockRestore();
  });

  it('lists locked snapshots', async () => {
    lockSnapshot('alpha', 'prod deploy');
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const program = makeProgram();
    await program.parseAsync(['node', 'test', 'lock', 'list']);
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('alpha'));
    spy.mockRestore();
  });
});
