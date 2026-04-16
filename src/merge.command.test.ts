import { Command } from 'commander';
import { registerMergeCommand } from './merge.command';
import * as snapshot from './snapshot';
import * as merge from './merge';

jest.mock('./snapshot');
jest.mock('./merge');

const mockListSnapshots = snapshot.listSnapshots as jest.Mock;
const mockLoadSnapshot = snapshot.loadSnapshot as jest.Mock;
const mockSaveSnapshot = snapshot.saveSnapshot as jest.Mock;
const mockMergeEnvs = merge.mergeEnvs as jest.Mock;
const mockPreviewMerge = merge.previewMerge as jest.Mock;

function makeProgram() {
  const program = new Command();
  program.exitOverride();
  registerMergeCommand(program);
  return program;
}

beforeEach(() => {
  jest.clearAllMocks();
  mockListSnapshots.mockReturnValue(['snap1', 'snap2']);
  mockLoadSnapshot.mockImplementation((name: string) =>
    name === 'snap1' ? { FOO: 'foo' } : { FOO: 'bar', BAZ: 'baz' }
  );
  mockMergeEnvs.mockReturnValue({ FOO: 'bar', BAZ: 'baz' });
});

describe('merge command', () => {
  it('merges two snapshots and saves result', async () => {
    const program = makeProgram();
    await program.parseAsync(['merge', 'snap1', 'snap2', '--output', 'merged'], { from: 'user' });
    expect(mockMergeEnvs).toHaveBeenCalledWith({ FOO: 'foo' }, { FOO: 'bar', BAZ: 'baz' }, 'override');
    expect(mockSaveSnapshot).toHaveBeenCalledWith('merged', { FOO: 'bar', BAZ: 'baz' });
  });

  it('uses default output name when --output not provided', async () => {
    const program = makeProgram();
    await program.parseAsync(['merge', 'snap1', 'snap2'], { from: 'user' });
    expect(mockSaveSnapshot).toHaveBeenCalledWith('snap1-snap2-merged', expect.any(Object));
  });

  it('shows preview without saving when --preview flag is set', async () => {
    mockPreviewMerge.mockReturnValue({
      FOO: { base: 'foo', override: 'bar', result: 'bar' },
    });
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const program = makeProgram();
    await program.parseAsync(['merge', 'snap1', 'snap2', '--preview'], { from: 'user' });
    expect(mockSaveSnapshot).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('exits with error if base snapshot not found', async () => {
    mockListSnapshots.mockReturnValue(['snap2']);
    const program = makeProgram();
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    await expect(program.parseAsync(['merge', 'snap1', 'snap2'], { from: 'user' })).rejects.toThrow();
    exitSpy.mockRestore();
  });
});
