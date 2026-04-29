import { Command } from 'commander';
import {
  setStatus,
  removeStatus,
  getStatus,
  listByStatus,
  SnapshotStatus,
} from './snapshot-status';

const VALID_STATUSES: SnapshotStatus[] = ['active', 'archived', 'deprecated', 'draft'];

export function registerSnapshotStatusCommand(program: Command): void {
  const status = program
    .command('status')
    .description('Manage snapshot status labels');

  status
    .command('set <snapshot> <status>')
    .description(`Set status for a snapshot (${VALID_STATUSES.join(', ')})`)
    .action((snapshot: string, statusValue: string) => {
      if (!VALID_STATUSES.includes(statusValue as SnapshotStatus)) {
        console.error(`Invalid status "${statusValue}". Valid values: ${VALID_STATUSES.join(', ')}`);
        process.exit(1);
      }
      const entry = setStatus(snapshot, statusValue as SnapshotStatus);
      console.log(`Status for "${entry.snapshotName}" set to "${entry.status}" at ${entry.updatedAt}`);
    });

  status
    .command('get <snapshot>')
    .description('Get the current status of a snapshot')
    .action((snapshot: string) => {
      const s = getStatus(snapshot);
      if (s === null) {
        console.log(`No status set for "${snapshot}"`);
      } else {
        console.log(`${snapshot}: ${s}`);
      }
    });

  status
    .command('remove <snapshot>')
    .description('Remove the status label from a snapshot')
    .action((snapshot: string) => {
      const removed = removeStatus(snapshot);
      if (removed) {
        console.log(`Status removed from "${snapshot}"`);
      } else {
        console.log(`No status found for "${snapshot}"`);
      }
    });

  status
    .command('list <status>')
    .description('List all snapshots with a given status')
    .action((statusValue: string) => {
      if (!VALID_STATUSES.includes(statusValue as SnapshotStatus)) {
        console.error(`Invalid status "${statusValue}". Valid values: ${VALID_STATUSES.join(', ')}`);
        process.exit(1);
      }
      const snaps = listByStatus(statusValue as SnapshotStatus);
      if (snaps.length === 0) {
        console.log(`No snapshots with status "${statusValue}"`);
      } else {
        snaps.forEach((s) => console.log(s));
      }
    });
}
