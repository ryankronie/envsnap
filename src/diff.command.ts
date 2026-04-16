import { Command } from 'commander';
import { diffSnapshots, diffWithCurrent } from './diff';
import { loadSnapshot } from './snapshot';
import { formatDiff, formatSummary } from './format';

export function registerDiffCommand(program: Command): void {
  program
    .command('diff <project> <snapshotA> [snapshotB]')
    .description('Diff two snapshots or a snapshot against current environment')
    .option('--no-mask', 'Show raw values instead of masked')
    .option('--summary', 'Show only summary line')
    .action(async (project: string, snapshotA: string, snapshotB: string | undefined, opts) => {
      try {
        const mask = opts.mask !== false;

        let entries;
        if (snapshotB) {
          entries = await diffSnapshots(project, snapshotA, snapshotB);
          console.log(`Diff: ${snapshotA} → ${snapshotB}`);
        } else {
          const snapshot = await loadSnapshot(project, snapshotA);
          entries = diffWithCurrent(snapshot.env);
          console.log(`Diff: ${snapshotA} → current environment`);
        }

        if (opts.summary) {
          console.log(formatSummary(entries));
        } else {
          console.log(formatDiff(entries, mask));
          console.log();
          console.log(formatSummary(entries));
        }
      } catch (err: any) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
      }
    });
}
