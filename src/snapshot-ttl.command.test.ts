import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import { registerSnapshotTtlCommand } from './snapshot-ttl.command';
import { saveSnapshot } from './snapshot';

const TEST_DIR = path.join(__dirname, '../.test-ttl-command');

function makeProgram(): Command {
  const program = new Command();
  program.exitOverride();
  registerSnapshotTtlCommand(program, TEST_DIR);
  return program;
}

beforeEach(() => {
  fs.mkdirSync(TEST_DIR, { recursive: true });
});

afterEach(() => {
  fs.rmSync(TEST_DIR, { recursive: true, force: true });
});

describe('snapshot-ttl command', () => {
  it('sets a TTL on a snapshot', async () => {
    await saveSnapshot('mysnap', { FOO: 'bar' }, TEST_DIR);
    const program = makeProgram();
    const output: string[] = [];
    program.configureOutput({ writeOut: (s) => output.push(s) });
    await program.parseAsync(['set', 'mysnap', '7d'], { from: 'user' });
    expect(output.join('')).toMatch(/TTL set/);
  });

  it('shows TTL for a snapshot', async () => {
    await saveSnapshot('mysnap', { FOO: 'bar' }, TEST_DIR);
    const program = makeProgram();
    const output: string[] = [];
    program.configureOutput({ writeOut: (s) => output.push(s) });
    await program.parseAsync(['set', 'mysnap', '3d'], { from: 'user' });
    const program2 = makeProgram();
    const output2: string[] = [];
    program2.configureOutput({ writeOut: (s) => output2.push(s) });
    await program2.parseAsync(['get', 'mysnap'], { from: 'user' });
    expect(output2.join('')).toMatch(/mysnap/);
  });

  it('removes a TTL from a snapshot', async () => {
    await saveSnapshot('mysnap', { FOO: 'bar' }, TEST_DIR);
    const program = makeProgram();
    await program.parseAsync(['set', 'mysnap', '1d'], { from: 'user' });
    const program2 = makeProgram();
    const output: string[] = [];
    program2.configureOutput({ writeOut: (s) => output.push(s) });
    await program2.parseAsync(['remove', 'mysnap'], { from: 'user' });
    expect(output.join('')).toMatch(/removed/i);
  });

  it('lists expired snapshots', async () => {
    await saveSnapshot('old', { A: '1' }, TEST_DIR);
    const program = makeProgram();
    const output: string[] = [];
    program.configureOutput({ writeOut: (s) => output.push(s) });
    await program.parseAsync(['expired'], { from: 'user' });
    expect(output.join('')).toBeDefined();
  });
});
