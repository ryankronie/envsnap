import { Command } from 'commander';
import { pruneSnapshots, PruneOptions } from './prune';

export function registerPruneCommand(program: Command): void {
  program
    .command('prune')
    .description('Remove old or excess snapshots based on age or count')
    .option('--keep <n>', 'Keep only the N most recent snapshots', parseInt)
    .option('--older-than <days>', 'Remove snapshots older than N days', parseInt)
    .option('--dry-run', 'Preview which snapshots would be removed without deleting', false)
    .option('--tag <tag>', 'Only prune snapshots with a specific tag')
    .action(async (opts) => {
      const options: PruneOptions = {};

      if (opts.keep !== undefined) options.keep = opts.keep;
      if (opts.olderThan !== undefined) options.olderThanDays = opts.olderThan;
      if (opts.dryRun) options.dryRun = true;
      if (opts.tag) options.tag = opts.tag;

      if (!options.keep && !options.olderThanDays) {
        console.error('Error: provide --keep or --older-than to prune snapshots.');
        process.exit(1);
      }

      try {
        const removed = await pruneSnapshots(options);

        if (removed.length === 0) {
          console.log('No snapshots matched the prune criteria.');
          return;
        }

        if (options.dryRun) {
          console.log(`Dry run — would remove ${removed.length} snapshot(s):`);
        } else {
          console.log(`Pruned ${removed.length} snapshot(s):`);
        }

        for (const name of removed) {
          console.log(`  - ${name}`);
        }
      } catch (err: any) {
        console.error('Prune failed:', err.message);
        process.exit(1);
      }
    });
}
