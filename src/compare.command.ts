import { Command } from 'commander';
import { compareSnapshots } from './compare';
import { formatDiff, formatSummary } from './format';

export function registerCompareCommand(program: Command): void {
  program
    .command('compare <snapshotA> <snapshotB>')
    .description('Compare two snapshots and show differences')
    .option('--no-mask', 'Show values unmasked')
    .option('--summary', 'Show summary only')
    .action(async (snapshotA: string, snapshotB: string, opts) => {
      try {
        const result = await compareSnapshots(snapshotA, snapshotB);

        console.log(
          `\nComparing "${snapshotA}" → "${snapshotB}"\n`
        );

        if (opts.summary) {
          const { added, removed, changed, unchanged } = result.summary;
          console.log(
            `Added: ${added}  Removed: ${removed}  Changed: ${changed}  Unchanged: ${unchanged}`
          );
          return;
        }

        const mask = opts.mask !== false;
        const formatted = formatDiff(result.diff, mask);
        console.log(formatted);
        console.log(formatSummary(result.summary));
      } catch (err: any) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
      }
    });
}
