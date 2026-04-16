import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import { registerTagCommand } from './tag.command';
import { addTag } from './tag';

const TEST_DIR = path.join(process.cwd(), '.test-tag-cmd');

function makeProgram() {
  const program = new Command();
  program.exitOverride();
  registerTagCommand(program);
  return program;
}

beforeEach(() => {
  fs.mkdirSync(TEST_DIR, { recursive: true });
  vi.spyOn(process, 'env', 'get').mockReturnValue({ ...process.env, HOME: TEST_DIR });
});

afterEach(() => {
  fs.rmSync(TEST_DIR, { recursive: true, force: true });
  vi.restoreAllMocks();
});

describe('tag command', () => {
  it('add prints confirmation', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const program = makeProgram();
    program.parse(['tag', 'add', 'mysnap', 'prod'], { from: 'user' });
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('Tagged'));
    spy.mockRestore();
  });

  it('list prints no tags message when empty', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const program = makeProgram();
    program.parse(['tag', 'list', 'nosnap'], { from: 'user' });
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('No tags'));
    spy.mockRestore();
  });

  it('find prints no snapshots when none tagged', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const program = makeProgram();
    program.parse(['tag', 'find', 'missing'], { from: 'user' });
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('No snapshots'));
    spy.mockRestore();
  });
});
