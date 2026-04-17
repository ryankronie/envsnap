import { Command } from 'commander';
import { loadHistory, getHistoryForSnapshot, clearHistory } from './history';

export function registerHistoryCommand(program: Command): void {
  const history = program
    .command('history')
    .description('Manage action history');

  history
    .command('list')
    .description('List all recorded actions')
    .option('-n, --name <name>', 'Filter by snapshot name')
    .option('-l, --limit <number>', 'Limit number of entries shown', parseInt)
    .action(async (opts: { name?: string; limit?: number }) => {
      try {
        const entries = opts.name
          ? await getHistoryForSnapshot(opts.name)
          : await loadHistory();
        if (entries.length === 0) {
          console.log('No history found.');
          return;
        }
        const limited = opts.limit ? entries.slice(-opts.limit) : entries;
        for (const e of limited) {
          console.log(`[${new Date(e.timestamp).toISOString()}] ${e.action} -> ${e.snapshotName}`);
        }
      } catch (err: any) {
        .message}`);
        process.exit(1);
      }
    });

  history
    .command('clear')
    .description('Clear all history')
    .action(async () => {
      try {
        await clearHistory();
        console.log('History cleared.');
      } catch (err: any) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
      }
    });
}
