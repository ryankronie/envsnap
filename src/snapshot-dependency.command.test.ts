import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { registerSnapshotDependencyCommand } from './snapshot-dependency.command';
import { addDependency } from './snapshot-dependency';

function makeProgram(dir: string): Command {
  const program = new Command();
  program.exitOverride();
  registerSnapshotDependencyCommand(program);
  return program;
}

const tmpDir = () => fs.mkdtempSync(path.join(os.tmpdir(), 'envsnap-dep-cmd-'));

describe('snapshot-dependency command', () => {
  let dir: string;
  let program: Command;
  let output: string[];

  beforeEach(() => {
    dir = tmpDir();
    program = makeProgram(dir);
    output = [];
    jest.spyOn(console, 'log').mockImplementation((...args) => output.push(args.join(' ')));
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    fs.rmSync(dir, { recursive: true, force: true });
    jest.restoreAllMocks();
  });

  it('adds a dependency', async () => {
    await program.parseAsync(['dep', 'add', 'snap1', 'snap2', '--dir', dir], { from: 'user' });
    expect(output.join(' ')).toContain('snap1 depends on snap2');
  });

  it('rejects a cycle', async () => {
    addDependency(dir, 'snap1', 'snap2');
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    await expect(
      program.parseAsync(['dep', 'add', 'snap2', 'snap1', '--dir', dir], { from: 'user' })
    ).rejects.toThrow();
    exitSpy.mockRestore();
  });

  it('lists dependencies', async () => {
    addDependency(dir, 'snap1', 'snap2');
    await program.parseAsync(['dep', 'list', 'snap1', '--dir', dir], { from: 'user' });
    expect(output.join(' ')).toContain('snap2');
  });

  it('lists dependents', async () => {
    addDependency(dir, 'snap1', 'snap2');
    await program.parseAsync(['dep', 'dependents', 'snap2', '--dir', dir], { from: 'user' });
    expect(output.join(' ')).toContain('snap1');
  });

  it('removes a dependency', async () => {
    addDependency(dir, 'snap1', 'snap2');
    await program.parseAsync(['dep', 'remove', 'snap1', 'snap2', '--dir', dir], { from: 'user' });
    expect(output.join(' ')).toContain('Removed');
  });
});
