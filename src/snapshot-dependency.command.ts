import { Command } from 'commander';
import {
  addDependency,
  removeDependency,
  getDependencies,
  getDependents,
  hasCycle,
} from './snapshot-dependency';
import { ensureSnapshotsDir } from './snapshot';

const DEFAULT_DIR = '.envsnap';

export function registerSnapshotDependencyCommand(program: Command): void {
  const dep = program.command('dep').description('Manage snapshot dependencies');

  dep
    .command('add <snapshot> <dependsOn>')
    .description('Add a dependency between snapshots')
    .option('--dir <dir>', 'Snapshots directory', DEFAULT_DIR)
    .action((snapshot: string, dependsOn: string, opts: { dir: string }) => {
      if (hasCycle(opts.dir, snapshot, dependsOn)) {
        console.error(`Error: adding dependency would create a cycle.`);
        process.exit(1);
      }
      addDependency(opts.dir, snapshot, dependsOn);
      console.log(`Added: ${snapshot} depends on ${dependsOn}`);
    });

  dep
    .command('remove <snapshot> <dependsOn>')
    .description('Remove a dependency')
    .option('--dir <dir>', 'Snapshots directory', DEFAULT_DIR)
    .action((snapshot: string, dependsOn: string, opts: { dir: string }) => {
      removeDependency(opts.dir, snapshot, dependsOn);
      console.log(`Removed dependency: ${snapshot} -> ${dependsOn}`);
    });

  dep
    .command('list <snapshot>')
    .description('List dependencies of a snapshot')
    .option('--dir <dir>', 'Snapshots directory', DEFAULT_DIR)
    .action((snapshot: string, opts: { dir: string }) => {
      const deps = getDependencies(opts.dir, snapshot);
      if (deps.length === 0) {
        console.log(`No dependencies for "${snapshot}".`);
      } else {
        console.log(`Dependencies of "${snapshot}":`);
        deps.forEach((d) => console.log(`  - ${d}`));
      }
    });

  dep
    .command('dependents <snapshot>')
    .description('List snapshots that depend on a given snapshot')
    .option('--dir <dir>', 'Snapshots directory', DEFAULT_DIR)
    .action((snapshot: string, opts: { dir: string }) => {
      const dependents = getDependents(opts.dir, snapshot);
      if (dependents.length === 0) {
        console.log(`No dependents for "${snapshot}".`);
      } else {
        console.log(`Snapshots depending on "${snapshot}":`);
        dependents.forEach((d) => console.log(`  - ${d}`));
      }
    });
}
