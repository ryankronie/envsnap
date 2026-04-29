import { Command } from 'commander';
import * as fs from 'fs';
import { labelFilePath, addLabel } from './snapshot-label';
import { registerSnapshotLabelCommand } from './snapshot-label.command';

function cleanup() {
  if (fs.existsSync(labelFilePath)) fs.unlinkSync(labelFilePath);
}

function makeProgram() {
  const program = new Command();
  program.exitOverride();
  registerSnapshotLabelCommand(program);
  return program;
}

beforeEach(cleanup);
afterAll(cleanup);

describe('label add', () => {
  it('adds a label and prints confirmation', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    makeProgram().parse(['label', 'add', 'mysnap', 'prod'], { from: 'user' });
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('prod'));
    spy.mockRestore();
  });
});

describe('label remove', () => {
  it('removes a label and prints confirmation', () => {
    addLabel('mysnap', 'prod');
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    makeProgram().parse(['label', 'remove', 'mysnap', 'prod'], { from: 'user' });
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('removed'));
    spy.mockRestore();
  });
});

describe('label list', () => {
  it('lists labels for a snapshot', () => {
    addLabel('mysnap', 'dev');
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    makeProgram().parse(['label', 'list', 'mysnap'], { from: 'user' });
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('dev'));
    spy.mockRestore();
  });

  it('reports no labels when none exist', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    makeProgram().parse(['label', 'list', 'unknown'], { from: 'user' });
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('No labels'));
    spy.mockRestore();
  });
});

describe('label find', () => {
  it('finds snapshots by label', () => {
    addLabel('snapA', 'release');
    addLabel('snapB', 'release');
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    makeProgram().parse(['label', 'find', 'release'], { from: 'user' });
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('snapA'));
    spy.mockRestore();
  });
});

describe('label clear', () => {
  it('clears all labels from a snapshot', () => {
    addLabel('mysnap', 'x');
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    makeProgram().parse(['label', 'clear', 'mysnap'], { from: 'user' });
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('cleared'));
    spy.mockRestore();
  });
});
