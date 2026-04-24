import type { Command } from 'commander';
import {
  createGroup,
  addSnapshotToGroup,
  removeSnapshotFromGroup,
  deleteGroup,
  listGroups,
} from './snapshot-group';

export function registerSnapshotGroupCommand(program: Command): void {
  const group = program
    .command('group')
    .description('Manage snapshot groups');

  group
    .command('create <name>')
    .description('Create a new snapshot group')
    .option('-d, --description <desc>', 'Group description')
    .action((name: string, opts: { description?: string }) => {
      const g = createGroup(name, opts.description);
      console.log(`Group "${g.name}" created at ${g.createdAt}`);
    });

  group
    .command('add <group> <snapshot>')
    .description('Add a snapshot to a group')
    .action((groupName: string, snapshotName: string) => {
      addSnapshotToGroup(groupName, snapshotName);
      console.log(`Added "${snapshotName}" to group "${groupName}"`);
    });

  group
    .command('remove <group> <snapshot>')
    .description('Remove a snapshot from a group')
    .action((groupName: string, snapshotName: string) => {
      removeSnapshotFromGroup(groupName, snapshotName);
      console.log(`Removed "${snapshotName}" from group "${groupName}"`);
    });

  group
    .command('delete <name>')
    .description('Delete a snapshot group')
    .action((name: string) => {
      deleteGroup(name);
      console.log(`Group "${name}" deleted`);
    });

  group
    .command('list')
    .description('List all snapshot groups')
    .action(() => {
      const groups = listGroups();
      if (groups.length === 0) {
        console.log('No groups found.');
        return;
      }
      for (const g of groups) {
        const desc = g.description ? ` — ${g.description}` : '';
        console.log(`${g.name}${desc} (${g.snapshots.length} snapshots)`);
        for (const s of g.snapshots) {
          console.log(`  - ${s}`);
        }
      }
    });
}
