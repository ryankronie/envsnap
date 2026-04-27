import { Command } from 'commander';
import { setTtl, removeTtl, getTtl, getExpiredSnapshots } from './snapshot-ttl';
import { deleteSnapshot } from './snapshot';

export function registerSnapshotTtlCommand(program: Command): void {
  const ttl = program
    .command('ttl')
    .description('Manage time-to-live (TTL) for snapshots');

  ttl
    .command('set <snapshot> <seconds>')
    .description('Set a TTL (in seconds) for a snapshot')
    .action((snapshot: string, secondsStr: string) => {
      const seconds = parseInt(secondsStr, 10);
      if (isNaN(seconds) || seconds <= 0) {
        console.error('Error: seconds must be a positive integer');
        process.exit(1);
      }
      const entry = setTtl(snapshot, seconds);
      const expiresAt = new Date(entry.expiresAt).toISOString();
      console.log(`TTL set for "${snapshot}": expires at ${expiresAt}`);
    });

  ttl
    .command('get <snapshot>')
    .description('Show the TTL for a snapshot')
    .action((snapshot: string) => {
      const entry = getTtl(snapshot);
      if (!entry) {
        console.log(`No TTL set for "${snapshot}"`);
        return;
      }
      const expiresAt = new Date(entry.expiresAt).toISOString();
      const expired = Date.now() >= entry.expiresAt ? ' (EXPIRED)' : '';
      console.log(`"${snapshot}" expires at ${expiresAt}${expired}`);
    });

  ttl
    .command('remove <snapshot>')
    .description('Remove the TTL for a snapshot')
    .action((snapshot: string) => {
      const removed = removeTtl(snapshot);
      if (removed) {
        console.log(`TTL removed for "${snapshot}"`);
      } else {
        console.log(`No TTL found for "${snapshot}"`);
      }
    });

  ttl
    .command('purge')
    .description('Delete all snapshots whose TTL has expired')
    .option('--dry-run', 'List expired snapshots without deleting them')
    .action((opts: { dryRun?: boolean }) => {
      const expired = getExpiredSnapshots();
      if (expired.length === 0) {
        console.log('No expired snapshots found.');
        return;
      }
      if (opts.dryRun) {
        console.log('Expired snapshots (dry-run):');
        expired.forEach((name) => console.log(`  - ${name}`));
        return;
      }
      expired.forEach((name) => {
        try {
          deleteSnapshot(name);
          removeTtl(name);
          console.log(`Deleted expired snapshot: ${name}`);
        } catch {
          console.error(`Failed to delete snapshot: ${name}`);
        }
      });
    });
}
