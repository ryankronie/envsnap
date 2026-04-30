import { Command } from 'commander';
import { setOwner, removeOwner, getOwner, listOwners } from './snapshot-owner';

export function registerSnapshotOwnerCommand(program: Command): void {
  const owner = program
    .command('owner')
    .description('Manage snapshot ownership');

  owner
    .command('set <snapshot> <owner>')
    .description('Set the owner of a snapshot')
    .action(async (snapshot: string, ownerName: string) => {
      await setOwner(snapshot, ownerName);
      console.log(`Owner of '${snapshot}' set to '${ownerName}'.`);
    });

  owner
    .command('get <snapshot>')
    .description('Get the owner of a snapshot')
    .action(async (snapshot: string) => {
      const ownerName = await getOwner(snapshot);
      if (ownerName) {
        console.log(`Owner: ${ownerName}`);
      } else {
        console.log(`No owner set for '${snapshot}'.`);
      }
    });

  owner
    .command('remove <snapshot>')
    .description('Remove the owner of a snapshot')
    .action(async (snapshot: string) => {
      await removeOwner(snapshot);
      console.log(`Owner removed from '${snapshot}'.`);
    });

  owner
    .command('list')
    .description('List all snapshot owners')
    .action(async () => {
      const owners = await listOwners();
      const entries = Object.entries(owners);
      if (entries.length === 0) {
        console.log('No owners assigned.');
        return;
      }
      for (const [snap, ownerName] of entries) {
        console.log(`  ${snap}: ${ownerName}`);
      }
    });
}
