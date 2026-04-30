import { Command } from 'commander';
import { addChangelogEntry, getChangelog, clearChangelog } from './snapshot-changelog';

export function registerSnapshotChangelogCommand(program: Command): void {
  const changelog = program
    .command('changelog')
    .description('Manage per-snapshot changelog entries');

  changelog
    .command('add <snapshot> <action> <description>')
    .description('Add a changelog entry for a snapshot')
    .action((snapshot: string, action: string, description: string) => {
      addChangelogEntry(snapshot, action, description);
      console.log(`Changelog entry added for "${snapshot}": [${action}] ${description}`);
    });

  changelog
    .command('list <snapshot>')
    .description('List changelog entries for a snapshot')
    .option('--json', 'Output as JSON')
    .action((snapshot: string, opts: { json?: boolean }) => {
      const entries = getChangelog(snapshot);
      if (entries.length === 0) {
        console.log(`No changelog entries for "${snapshot}".`);
        return;
      }
      if (opts.json) {
        console.log(JSON.stringify(entries, null, 2));
        return;
      }
      console.log(`Changelog for "${snapshot}":`);
      for (const entry of entries) {
        console.log(`  [${entry.timestamp}] (${entry.action}) ${entry.description}`);
      }
    });

  changelog
    .command('clear <snapshot>')
    .description('Clear all changelog entries for a snapshot')
    .action((snapshot: string) => {
      clearChangelog(snapshot);
      console.log(`Changelog cleared for "${snapshot}".`);
    });
}
