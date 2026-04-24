import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import { registerSnapshotGroupCommand } from './snapshot-group.command';
import { ensureSnapshotsDir } from './snapshot';

const groupsFilePath = path.join(ensureSnapshotsDir(), '.groups.json');

function cleanup() {
  if (fs.existsSync(groupsFilePath)) fs.unlinkSync(groupsFilePath);
}

function makeProgram() {
  const program = new Command();
  program.exitOverride();
  registerSnapshotGroupCommand(program);
  return program;
}

beforeEach(cleanup);
afterAll(cleanup);

test('group create prints confirmation', () => {
  const program = makeProgram();
  const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  program.parse(['node', 'test', 'group', 'create', 'mygroup']);
  expect(spy).toHaveBeenCalledWith(expect.stringContaining('mygroup'));
  spy.mockRestore();
});

test('group add prints confirmation', () => {
  const program = makeProgram();
  const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  program.parse(['node', 'test', 'group', 'create', 'g1']);
  program.parse(['node', 'test', 'group', 'add', 'g1', 'snap-x']);
  expect(spy).toHaveBeenCalledWith(expect.stringContaining('snap-x'));
  spy.mockRestore();
});

test('group list shows groups', () => {
  const program = makeProgram();
  const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  program.parse(['node', 'test', 'group', 'create', 'g2', '-d', 'desc']);
  program.parse(['node', 'test', 'group', 'list']);
  expect(spy).toHaveBeenCalledWith(expect.stringContaining('g2'));
  spy.mockRestore();
});

test('group list shows empty message when no groups', () => {
  const program = makeProgram();
  const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  program.parse(['node', 'test', 'group', 'list']);
  expect(spy).toHaveBeenCalledWith('No groups found.');
  spy.mockRestore();
});

test('group delete removes group', () => {
  const program = makeProgram();
  const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  program.parse(['node', 'test', 'group', 'create', 'g3']);
  program.parse(['node', 'test', 'group', 'delete', 'g3']);
  expect(spy).toHaveBeenCalledWith(expect.stringContaining('deleted'));
  spy.mockRestore();
});
