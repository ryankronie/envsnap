import { Command } from 'commander';
import * as fs from 'fs';
import { registerSnapshotCommentCommand } from './snapshot-comment.command';
import { commentFilePath, setComment } from './snapshot-comment';

function cleanup() {
  const file = commentFilePath();
  if (fs.existsSync(file)) fs.unlinkSync(file);
}

function makeProgram(): Command {
  const program = new Command();
  program.exitOverride();
  registerSnapshotCommentCommand(program);
  return program;
}

beforeEach(cleanup);
afterAll(cleanup);

describe('comment set', () => {
  it('prints confirmation after setting a comment', async () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const program = makeProgram();
    await program.parseAsync(['comment', 'set', 'mysnap', 'hello world'], { from: 'user' });
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('hello world'));
    spy.mockRestore();
  });
});

describe('comment get', () => {
  it('prints no comment when none exists', async () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const program = makeProgram();
    await program.parseAsync(['comment', 'get', 'ghost'], { from: 'user' });
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('No comment'));
    spy.mockRestore();
  });

  it('prints the comment text when it exists', async () => {
    setComment('mysnap', 'test comment');
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const program = makeProgram();
    await program.parseAsync(['comment', 'get', 'mysnap'], { from: 'user' });
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('test comment'));
    spy.mockRestore();
  });
});

describe('comment remove', () => {
  it('reports removal of an existing comment', async () => {
    setComment('snap-to-remove', 'bye');
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const program = makeProgram();
    await program.parseAsync(['comment', 'remove', 'snap-to-remove'], { from: 'user' });
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('removed'));
    spy.mockRestore();
  });
});

describe('comment list', () => {
  it('shows no comments message when empty', async () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const program = makeProgram();
    await program.parseAsync(['comment', 'list'], { from: 'user' });
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('No comments'));
    spy.mockRestore();
  });

  it('lists all comments', async () => {
    setComment('alpha', 'first');
    setComment('beta', 'second');
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const program = makeProgram();
    await program.parseAsync(['comment', 'list'], { from: 'user' });
    const output = spy.mock.calls.map((c) => c[0]).join('\n');
    expect(output).toContain('alpha');
    expect(output).toContain('beta');
    spy.mockRestore();
  });
});
