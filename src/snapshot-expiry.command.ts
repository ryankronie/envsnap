import { Command } from 'commander';
import { setExpiry, removeExpiry, getExpiry, listExpired, isExpired } from './snapshot-expiry';

export function registerSnapshotExpiryCommand(program: Command): void {
  const expiry = program
    .command('expiry')
    .description('Manage snapshot expiry dates');

  expiry
    .command('set <snapshot> <date>')
    .description('Set expiry date for a snapshot (ISO 8601 or natural date string)')
    .action((snapshot: string, date: string) => {
      const parsed = new Date(date);
      if (isNaN(parsed.getTime())) {
        console.error(`Invalid date: ${date}`);
        process.exit(1);
      }
      setExpiry(snapshot, parsed);
      console.log(`Expiry set for "${snapshot}": ${parsed.toISOString()}`);
    });

  expiry
    .command('remove <snapshot>')
    .description('Remove expiry date from a snapshot')
    .action((snapshot: string) => {
      removeExpiry(snapshot);
      console.log(`Expiry removed from "${snapshot}"`);
    });

  expiry
    .command('get <snapshot>')
    .description('Show expiry date for a snapshot')
    .action((snapshot: string) => {
      const record = getExpiry(snapshot);
      if (!record) {
        console.log(`No expiry set for "${snapshot}"`);
        return;
      }
      const expired = isExpired(snapshot);
      const status = expired ? ' (EXPIRED)' : '';
      console.log(`${snapshot}: ${new Date(record.expiresAt).toISOString()}${status}`);
    });

  expiry
    .command('list-expired')
    .description('List all snapshots that have passed their expiry date')
    .action(() => {
      const expired = listExpired();
      if (expired.length === 0) {
        console.log('No expired snapshots found.');
        return;
      }
      console.log('Expired snapshots:');
      for (const record of expired) {
        console.log(`  ${record.snapshotName} — expired ${new Date(record.expiresAt).toISOString()}`);
      }
    });
}
