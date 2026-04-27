import { Command } from 'commander';
import {
  getAccessHistory,
  getRecentlyAccessed,
  clearAccessLog,
} from './snapshot-access';

function formatEntry(entry: {
  snapshot: string;
  accessedAt: string;
  action: string;
}): string {
  const date = new Date(entry.accessedAt).toLocaleString();
  return `  [${entry.action.toUpperCase().padEnd(6)}] ${entry.snapshot} — ${date}`;
}

export function registerSnapshotAccessCommand(program: Command): void {
  const access = program
    .command('access')
    .description('View snapshot access history');

  access
    .command('history <snapshot>')
    .description('Show access history for a specific snapshot')
    .action((snapshot: string) => {
      const entries = getAccessHistory(snapshot);
      if (entries.length === 0) {
        console.log(`No access history found for snapshot "${snapshot}".`);
        return;
      }
      console.log(`Access history for "${snapshot}":`);
      entries.forEach((e) => console.log(formatEntry(e)));
    });

  access
    .command('recent')
    .description('Show recently accessed snapshots')
    .option('-n, --limit <number>', 'Number of entries to show', '10')
    .action((opts: { limit: string }) => {
      const limit = parseInt(opts.limit, 10);
      const entries = getRecentlyAccessed(limit);
      if (entries.length === 0) {
        console.log('No access history recorded yet.');
        return;
      }
      console.log(`Recently accessed snapshots (last ${limit}):`);
      entries.forEach((e) => console.log(formatEntry(e)));
    });

  access
    .command('clear')
    .description('Clear all access log entries')
    .action(() => {
      clearAccessLog();
      console.log('Access log cleared.');
    });
}
