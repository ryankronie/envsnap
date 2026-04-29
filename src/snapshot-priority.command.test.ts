import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { registerSnapshotPriorityCommand } from './snapshot-priority.command';

const TEST_DIR = path.join(os.tmpdir(), 'envsnap-priority-cmd-test-' + Date.now());

jest.mock('./snapshot', () => ({
  ensureSnapshotsDir: () => TEST_DIR,
}));

function makeProgram(): Command {
  const program = new Command();
  program.exitOverride();
  registerSnapshotPriorityCommand(program);
  return program;
}

function cleanup() {
  if (fs.existsSync(TEST_DIR)) fs.rmSync(TEST_DIR, { recursive: true });
}

beforeEach(() => fs.mkdirSync(TEST_DIR, { recursive: true }));
afterEach(cleanup);

test('set command writes priority', () => {
  const program = makeProgram();
  const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  program.parse(['node', 'cli', 'priority', 'set', 'my-snap', 'high']);
  expect(spy).toHaveBeenCalledWith(expect.stringContaining('high'));
  spy.mockRestore();
});

test('set command rejects invalid level', () => {
  const program = makeProgram();
  const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
  const exitSpy = jest.spyOn(process, 'exit').mockImplementation((() => {}) as any);
  program.parse(['node', 'cli', 'priority', 'set', 'my-snap', 'ultra']);
  expect(spy).toHaveBeenCalledWith(expect.stringContaining('Invalid priority'));
  spy.mockRestore();
  exitSpy.mockRestore();
});

test('get command returns normal for unknown snapshot', () => {
  const program = makeProgram();
  const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  program.parse(['node', 'cli', 'priority', 'get', 'unknown-snap']);
  expect(spy).toHaveBeenCalledWith(expect.stringContaining('normal'));
  spy.mockRestore();
});

test('remove command outputs confirmation', () => {
  const program = makeProgram();
  const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  program.parse(['node', 'cli', 'priority', 'set', 'snap-x', 'low']);
  program.parse(['node', 'cli', 'priority', 'remove', 'snap-x']);
  expect(spy).toHaveBeenCalledWith(expect.stringContaining('removed'));
  spy.mockRestore();
});

test('list command with level shows matching snapshots', () => {
  const program = makeProgram();
  program.parse(['node', 'cli', 'priority', 'set', 'snap-y', 'critical']);
  const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  program.parse(['node', 'cli', 'priority', 'list', 'critical']);
  expect(spy).toHaveBeenCalledWith(expect.stringContaining('snap-y'));
  spy.mockRestore();
});
