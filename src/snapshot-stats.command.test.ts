import { Command } from 'commander';
import { registerSnapshotStatsCommand } from './snapshot-stats.command';
import { saveSnapshot, deleteSnapshot } from './snapshot';

function makeProgram() {
  const program = new Command();
  program.exitOverride();
  registerSnapshotStatsCommand(program);
  return program;
}

describe('stats show command', () => {
  const name = '__cmd_stats_snap__';
  afterEach(async () => { try { await deleteSnapshot(name); } catch {} });

  it('prints stats for a saved snapshot', async () => {
    await saveSnapshot(name, { FOO: 'bar', EMPTY: '' });
    const program = makeProgram();
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    await program.parseAsync(['node', 'envsnap', 'stats', 'show', name]);
    const output = spy.mock.calls.map(c => c.join(' ')).join('\n');
    expect(output).toContain('Total keys:');
    expect(output).toContain('2');
    expect(output).toContain('Empty values:');
    spy.mockRestore();
  });

  it('exits with error for missing snapshot', async () => {
    const program = makeProgram();
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    await expect(program.parseAsync(['node', 'envsnap', 'stats', 'show', '__nonexistent__'])).rejects.toThrow();
    spy.mockRestore();
    exitSpy.mockRestore();
  });
});

describe('stats summary command', () => {
  const names = ['__sum_a__', '__sum_b__'];
  afterEach(async () => { for (const n of names) { try { await deleteSnapshot(n); } catch {} } });

  it('prints aggregate stats', async () => {
    await saveSnapshot(names[0], { A: '1' });
    await saveSnapshot(names[1], { B: '2', C: '3' });
    const program = makeProgram();
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    await program.parseAsync(['node', 'envsnap', 'stats', 'summary']);
    const output = spy.mock.calls.map(c => c.join(' ')).join('\n');
    expect(output).toContain('Total snapshots:');
    expect(output).toContain('Average keys:');
    spy.mockRestore();
  });
});
