import { Command } from 'commander';
import {
  createProfile, addSnapshotToProfile, removeSnapshotFromProfile,
  deleteProfile, listProfiles
} from './profile';

export function registerProfileCommand(program: Command): void {
  const profile = program
    .command('profile')
    .description('Manage snapshot profiles (named groups of snapshots)');

  profile
    .command('create <name>')
    .description('Create a new profile')
    .option('-d, --description <desc>', 'Optional description')
    .action((name: string, opts: { description?: string }) => {
      try {
        const p = createProfile(name, opts.description);
        console.log(`Profile "${p.name}" created.`);
      } catch (err: any) {
        console.error(err.message);
        process.exit(1);
      }
    });

  profile
    .command('add <profile> <snapshot>')
    .description('Add a snapshot to a profile')
    .action((profileName: string, snapshotName: string) => {
      try {
        addSnapshotToProfile(profileName, snapshotName);
        console.log(`Snapshot "${snapshotName}" added to profile "${profileName}".`);
      } catch (err: any) {
        console.error(err.message);
        process.exit(1);
      }
    });

  profile
    .command('remove <profile> <snapshot>')
    .description('Remove a snapshot from a profile')
    .action((profileName: string, snapshotName: string) => {
      try {
        removeSnapshotFromProfile(profileName, snapshotName);
        console.log(`Snapshot "${snapshotName}" removed from profile "${profileName}".`);
      } catch (err: any) {
        console.error(err.message);
        process.exit(1);
      }
    });

  profile
    .command('delete <name>')
    .description('Delete a profile')
    .action((name: string) => {
      try {
        deleteProfile(name);
        console.log(`Profile "${name}" deleted.`);
      } catch (err: any) {
        console.error(err.message);
        process.exit(1);
      }
    });

  profile
    .command('list')
    .description('List all profiles')
    .action(() => {
      const profiles = listProfiles();
      if (profiles.length === 0) {
        console.log('No profiles found.');
        return;
      }
      profiles.forEach(p => {
        const desc = p.description ? ` — ${p.description}` : '';
        console.log(`${p.name}${desc} (${p.snapshots.length} snapshot(s))`);
        p.snapshots.forEach(s => console.log(`  • ${s}`));
      });
    });
}
