import { Command } from 'commander';
import fs from 'fs/promises';
import path from 'path';
import { registerRollbackCommand } from './rollback.command';
import { saveSnapshot } from './snapshot';
import { EnvSnapshot } from './types';

const TEST_DIR = path.join(__dirname, '../.test-snapshots-rollback-cmd');

function makeProgram(): Command {
  const program = new Command();
  program.exitOverride();
  registerRollbackCommand(program);
  return program;
}

function makeSnap(name: string, vars: Record<string, string>): EnvSnapshot {
  return { name, vars, createdAt: new Date().toISOString() };
}

beforeEach(async () => {
  process.env.ENVSNAP_DIR = TEST_DIR;
  await fs.mkdir(TEST_DIR, { recursive: true });
});

afterEach(async () => {
  delete process.env.ENVSNAP_DIR;
  await fs.rm(TEST_DIR, { recursive: true, force: true });
});

describe('rollback list', () => {
  it('prints no snapshots message when empty', async () => {
    const program = makeProgram();
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    await program.parseAsync(['rollback', 'list'], { from: 'user' });
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('No snapshots'));
    spy.mockRestore();
  });

  it('lists available snapshots', async () => {
    await saveSnapshot(makeSnap('snap-one', { X: '1' }));
    const program = makeProgram();
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    await program.parseAsync(['rollback', 'list'], { from: 'user' });
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('snap-one'));
    spy.mockRestore();
  });
});

describe('rollback apply', () => {
  it('prints dry-run message without applying', async () => {
    const program = makeProgram();
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    await program.parseAsync(['rollback', 'apply', 'v1', 'current', '--dry-run'], { from: 'user' });
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('dry-run'));
    spy.mockRestore();
  });

  it('applies rollback when target exists', async () => {
    await saveSnapshot(makeSnap('v1', { FOO: 'bar' }));
    const program = makeProgram();
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    await program.parseAsync(['rollback', 'apply', 'v1', 'active'], { from: 'user' });
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('Rolled back'));
    spy.mockRestore();
  });
});
