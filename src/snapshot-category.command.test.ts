import { Command } from 'commander';
import * as fs from 'fs';
import { registerSnapshotCategoryCommand } from './snapshot-category.command';
import { categoryFilePath, saveCategories } from './snapshot-category';

function cleanup() {
  const file = categoryFilePath();
  if (fs.existsSync(file)) fs.unlinkSync(file);
}

function makeProgram(): Command {
  const program = new Command();
  program.exitOverride();
  registerSnapshotCategoryCommand(program);
  return program;
}

beforeEach(cleanup);
afterAll(cleanup);

describe('category set', () => {
  it('assigns a category and prints confirmation', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    makeProgram().parse(['category', 'set', 'snap1', 'production'], { from: 'user' });
    expect(spy).toHaveBeenCalledWith('Category "production" assigned to snapshot "snap1".');
    spy.mockRestore();
  });
});

describe('category get', () => {
  it('prints the category for a snapshot', () => {
    saveCategories({ snap1: 'staging' });
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    makeProgram().parse(['category', 'get', 'snap1'], { from: 'user' });
    expect(spy).toHaveBeenCalledWith('snap1: staging');
    spy.mockRestore();
  });

  it('prints message when no category assigned', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    makeProgram().parse(['category', 'get', 'unknown'], { from: 'user' });
    expect(spy).toHaveBeenCalledWith('No category assigned to "unknown".');
    spy.mockRestore();
  });
});

describe('category remove', () => {
  it('removes the category and prints confirmation', () => {
    saveCategories({ snap1: 'dev' });
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    makeProgram().parse(['category', 'remove', 'snap1'], { from: 'user' });
    expect(spy).toHaveBeenCalledWith('Category removed from "snap1".');
    spy.mockRestore();
  });
});

describe('category list', () => {
  it('lists snapshots in a given category', () => {
    saveCategories({ snap1: 'production', snap2: 'staging', snap3: 'production' });
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    makeProgram().parse(['category', 'list', 'production'], { from: 'user' });
    const calls = spy.mock.calls.map((c) => c[0]);
    expect(calls).toContain('snap1');
    expect(calls).toContain('snap3');
    spy.mockRestore();
  });

  it('lists all categories when no argument given', () => {
    saveCategories({ snap1: 'production', snap2: 'staging' });
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    makeProgram().parse(['category', 'list'], { from: 'user' });
    const calls = spy.mock.calls.map((c) => c[0]);
    expect(calls).toContain('production');
    expect(calls).toContain('staging');
    spy.mockRestore();
  });
});
