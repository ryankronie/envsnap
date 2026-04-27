import { Command } from 'commander';
import {
  lockSnapshot,
  unlockSnapshot,
  isLocked,
  listLocked,
  getLockEntry,
} from './snapshot-lock';

export function registerSnapshotLockCommand(program: Command): void {
  const lock = program
    .command('lock')
    .description('Lock or unlock snapshots to prevent modification');

  lock
    .command('add <name>')
    .description('Lock a snapshot')
    .option('-r, --reason <reason>', 'Reason for locking')
    .action((name: string, opts: { reason?: string }) => {
      if (isLocked(name)) {
        console.log(`Snapshot "${name}" is already locked.`);
        return;
      }
      lockSnapshot(name, opts.reason);
      console.log(`Snapshot "${name}" locked.`);
    });

  lock
    .command('remove <name>')
    .description('Unlock a snapshot')
    .action((name: string) => {
      if (!isLocked(name)) {
        console.log(`Snapshot "${name}" is not locked.`);
        return;
      }
      unlockSnapshot(name);
      console.log(`Snapshot "${name}" unlocked.`);
    });

  lock
    .command('status <name>')
    .description('Check if a snapshot is locked')
    .action((name: string) => {
      const entry = getLockEntry(name);
      if (entry) {
        console.log(`Locked since: ${entry.lockedAt}`);
        if (entry.reason) console.log(`Reason: ${entry.reason}`);
      } else {
        console.log(`Snapshot "${name}" is not locked.`);
      }
    });

  lock
    .command('list')
    .description('List all locked snapshots')
    .action(() => {
      const entries = listLocked();
      if (entries.length === 0) {
        console.log('No snapshots are locked.');
        return;
      }
      entries.forEach((e) => {
        const reason = e.reason ? ` — ${e.reason}` : '';
        console.log(`${e.snapshotName} (locked ${e.lockedAt})${reason}`);
      });
    });
}
