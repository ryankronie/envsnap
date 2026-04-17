import { Command } from 'commander';
import { registerPinCommand } from './pin.command';
import { saveSnapshot } from './snapshot';
import { loadPins } from './pin';
import * as fs from 'fs';
import * as path from 'path';

const TEST_DIR = path.join(__dirname, '../.test-snapshots-pin-cmd');

function makeProgram() {
  const program = new Command();
  registerPinCommand(program, TEST_DIR);
  return program;
}

beforeEach(() => {
  if (!fs.existsSync(TEST_DIR)) fs.mkdirSync(TEST_DIR, { recursive: true });
});

afterEach(() => {
  fs.rmSync(TEST_DIR, { recursive: true, force: true });
});

describe('pin command', () => {
  it('pins a snapshot', async () => {
    await saveSnapshot('mysnap', { FOO: 'bar' }, TEST_DIR);
    const program = makeProgram();
    await program.parseAsync(['node', 'test', 'pin', 'mysnap']);
    const pins = loadPins(TEST_DIR);
    expect(pins).toContain('mysnap');
  });

  it('unpins a snapshot', async () => {
    await saveSnapshot('mysnap', { FOO: 'bar' }, TEST_DIR);
    const program = makeProgram();
    await program.parseAsync(['node', 'test', 'pin', 'mysnap']);
    await program.parseAsync(['node', 'test', 'unpin', 'mysnap']);
    const pins = loadPins(TEST_DIR);
    expect(pins).not.toContain('mysnap');
  });

  it('lists pinned snapshots', async () => {
    await saveSnapshot('snap1', { A: '1' }, TEST_DIR);
    await saveSnapshot('snap2', { B: '2' }, TEST_DIR);
    const program = makeProgram();
    await program.parseAsync(['node', 'test', 'pin', 'snap1']);
    await program.parseAsync(['node', 'test', 'pin', 'snap2']);
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    await program.parseAsync(['node', 'test', 'pins']);
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('snap1'));
    spy.mockRestore();
  });
});
