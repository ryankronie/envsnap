import { Command } from 'commander';
import { pinSnapshot, unpinSnapshot, listPinned, isPinned } from './pin';

export function registerPinCommand(program: Command): void {
  const pindescription('Manage pinned snapshots');

  pin
    .command('add <name>')
    .description('Pin a snapshot to prevent accidental deletion')
    .action((name: string) => {
      try {
        pinSnapshot(name);
        console.log(`Pinned snapshot "${name}".`);
      } catch (err: any) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
      }
    });

  pin
    .command('remove <name>')
    .description('Unpin a snapshot')
    .action((name: string) => {
      try {
        unpinSnapshot(name);
        console.log(`Unpinned snapshot "${name}".`);
      } catch (err: any) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
      }
    });

  pin
    .command('list')
    .description('List all pinned snapshots')
    .action(() => {
      const pinned = listPinned();
      if (pinned.length === 0) {
        console.log('No pinned snapshots.');
      } else {
        console.log('Pinned snapshots:');
        pinned.forEach((name) => console.log(`  - ${name}`));
      }
    });

  pin
    .command('check <name>')
    .description('Check if a snapshot is pinned')
    .action((name: string) => {
      const pinned = isPinned(name);
      console.log(`Snapshot "${name}" is ${pinned ? 'pinned' : 'not pinned'}.`);
    });
}
