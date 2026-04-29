import { Command } from 'commander';
import { setVisibility, getVisibility, removeVisibility, listByVisibility, Visibility } from './snapshot-visibility';

const VALID_VISIBILITIES: Visibility[] = ['public', 'private', 'shared'];

export function registerSnapshotVisibilityCommand(program: Command): void {
  const vis = program
    .command('visibility')
    .description('Manage snapshot visibility (public, private, shared)');

  vis
    .command('set <snapshot> <visibility>')
    .description('Set visibility for a snapshot')
    .action((snapshot: string, visibility: string) => {
      if (!VALID_VISIBILITIES.includes(visibility as Visibility)) {
        console.error(`Invalid visibility "${visibility}". Choose from: ${VALID_VISIBILITIES.join(', ')}`);
        process.exit(1);
      }
      setVisibility(snapshot, visibility as Visibility);
      console.log(`Visibility of "${snapshot}" set to "${visibility}".`);
    });

  vis
    .command('get <snapshot>')
    .description('Get visibility for a snapshot')
    .action((snapshot: string) => {
      const v = getVisibility(snapshot);
      console.log(`${snapshot}: ${v}`);
    });

  vis
    .command('remove <snapshot>')
    .description('Remove visibility setting (resets to private)')
    .action((snapshot: string) => {
      removeVisibility(snapshot);
      console.log(`Visibility entry for "${snapshot}" removed.`);
    });

  vis
    .command('list <visibility>')
    .description('List all snapshots with a given visibility')
    .action((visibility: string) => {
      if (!VALID_VISIBILITIES.includes(visibility as Visibility)) {
        console.error(`Invalid visibility "${visibility}". Choose from: ${VALID_VISIBILITIES.join(', ')}`);
        process.exit(1);
      }
      const names = listByVisibility(visibility as Visibility);
      if (names.length === 0) {
        console.log(`No snapshots with visibility "${visibility}".`);
      } else {
        names.forEach((n) => console.log(n));
      }
    });
}
