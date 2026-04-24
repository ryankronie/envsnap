import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import { registerProfileCommand } from './profile.command';

const PROFILES_FILE = path.join(process.env.HOME || '.', '.envsnap', 'profiles.json');

function cleanup() {
  if (fs.existsSync(PROFILES_FILE)) fs.unlinkSync(PROFILES_FILE);
}

function makeProgram() {
  const program = new Command();
  program.exitOverride();
  registerProfileCommand(program);
  return program;
}

beforeEach(cleanup);
afterAll(cleanup);

describe('profile create', () => {
  it('creates a profile and logs success', async () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const program = makeProgram();
    await program.parseAsync(['node', 'test', 'profile', 'create', 'myprofile']);
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('myprofile'));
    spy.mockRestore();
  });

  it('prints error and exits if profile already exists', async () => {
    const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    const program = makeProgram();
    await program.parseAsync(['node', 'test', 'profile', 'create', 'dup']);
    await expect(
      program.parseAsync(['node', 'test', 'profile', 'create', 'dup'])
    ).rejects.toThrow('exit');
    expect(errSpy).toHaveBeenCalled();
    errSpy.mockRestore();
    exitSpy.mockRestore();
  });
});

describe('profile list', () => {
  it('shows no profiles message when empty', async () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const program = makeProgram();
    await program.parseAsync(['node', 'test', 'profile', 'list']);
    expect(spy).toHaveBeenCalledWith('No profiles found.');
    spy.mockRestore();
  });

  it('lists profiles with snapshot counts', async () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const program = makeProgram();
    await program.parseAsync(['node', 'test', 'profile', 'create', 'alpha', '-d', 'Alpha env']);
    await program.parseAsync(['node', 'test', 'profile', 'add', 'alpha', 'snap-001']);
    spy.mockClear();
    await program.parseAsync(['node', 'test', 'profile', 'list']);
    const output = spy.mock.calls.map(c => c[0]).join('\n');
    expect(output).toContain('alpha');
    expect(output).toContain('snap-001');
    spy.mockRestore();
  });
});

describe('profile delete', () => {
  it('deletes an existing profile', async () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const program = makeProgram();
    await program.parseAsync(['node', 'test', 'profile', 'create', 'todelete']);
    await program.parseAsync(['node', 'test', 'profile', 'delete', 'todelete']);
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('deleted'));
    spy.mockRestore();
  });
});
