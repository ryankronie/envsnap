import { Command } from 'commander';
import * as fs from 'fs';
import { registerSnapshotBookmarkCommand } from './snapshot-bookmark.command';
import { bookmarkFilePath, addBookmark } from './snapshot-bookmark';

function makeProgram() {
  const program = new Command();
  program.exitOverride();
  registerSnapshotBookmarkCommand(program);
  return program;
}

function cleanup() {
  const fp = bookmarkFilePath();
  if (fs.existsSync(fp)) fs.unlinkSync(fp);
}

beforeEach(cleanup);
afterAll(cleanup);

describe('bookmark add', () => {
  it('adds a bookmark and prints confirmation', async () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const program = makeProgram();
    await program.parseAsync(['bookmark', 'add', 'staging', 'snap-stg-1'], { from: 'user' });
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('staging'));
    spy.mockRestore();
  });

  it('prints error if bookmark already exists', async () => {
    addBookmark('existing', 'snap-x');
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const program = makeProgram();
    await expect(
      program.parseAsync(['bookmark', 'add', 'existing', 'snap-y'], { from: 'user' })
    ).rejects.toThrow();
    spy.mockRestore();
  });
});

describe('bookmark list', () => {
  it('shows no bookmarks when empty', async () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const program = makeProgram();
    await program.parseAsync(['bookmark', 'list'], { from: 'user' });
    expect(spy).toHaveBeenCalledWith('No bookmarks found.');
    spy.mockRestore();
  });

  it('lists existing bookmarks', async () => {
    addBookmark('bm-a', 'snap-a', 'desc a');
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const program = makeProgram();
    await program.parseAsync(['bookmark', 'list'], { from: 'user' });
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('bm-a'));
    spy.mockRestore();
  });
});

describe('bookmark remove', () => {
  it('removes a bookmark', async () => {
    addBookmark('to-del', 'snap-del');
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const program = makeProgram();
    await program.parseAsync(['bookmark', 'remove', 'to-del'], { from: 'user' });
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('removed'));
    spy.mockRestore();
  });
});

describe('bookmark show', () => {
  it('shows bookmark details', async () => {
    addBookmark('detail-bm', 'snap-detail', 'my desc');
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const program = makeProgram();
    await program.parseAsync(['bookmark', 'show', 'detail-bm'], { from: 'user' });
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('snap-detail'));
    spy.mockRestore();
  });
});
