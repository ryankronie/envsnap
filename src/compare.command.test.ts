import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import { saveSnapshot } from './snapshot';
import { registerCompareCommand } from './compare.command';

const TEST_DIR = path.join(__dirname, '../.snapshots-test-compare-cmd');

function makeProgram() {
  const program = new Command();
  program.exitOverride();
  registerCompareCommand(program);
  return program;
}

/** Capture console.log output during an async operation. */
async function captureOutput(fn: () => Promise<void>): Promise<string[]> {
  const logs: string[] = [];
  const orig = console.log;
  console.log = (msg: string) => logs.push(msg ?? '');
  try {
    await fn();
  } finally {
    console.log = orig;
  }
  return logs;
}

beforeEach(() => {
  process.env.SNAPSHOTS_DIR = TEST_DIR;
});

afterEach(() => {
  if (fs.existsSync(TEST_DIR)) {
    fs.rmSync(TEST_DIR, { recursive: true });
  }
  delete process.env.SNAPSHOTS_DIR;
});

describe('compare command', () => {
  it('outputs diff between two snapshots', async () => {
    await saveSnapshot('c1', { FOO: 'bar' });
    await saveSnapshot('c2', { FOO: 'baz' });

    const program = makeProgram();
    const logs = await captureOutput(() =>
      program.parseAsync(['compare', 'c1', 'c2'], { from: 'user' })
    );

    expect(logs.some((l) => l.includes('c1'))).toBe(true);
  });

  it('outputs summary only with --summary flag', async () => {
    await saveSnapshot('s1', { A: '1', B: '2' });
    await saveSnapshot('s2', { A: '1', C: '3' });

    const program = makeProgram();
    const logs = await captureOutput(() =>
      program.parseAsync(['compare', 's1', 's2', '--summary'], { from: 'user' })
    );

    expect(logs.some((l) => /Added/.test(l))).toBe(true);
  });
});
