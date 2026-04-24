import { Command } from 'commander';
import { rollbackSnapshot, listRollbackTargets } from './rollback';
import { listSnapshots } from './snapshot';

export function registerRollbackCommand(program: Command): void {
  const rollback = program
    .command('rollback')
    .description('Roll back a snapshot to a previous version');

  rollback
    .command('apply <target> <current>')
    .description('Apply <target> snapshot as the new state of <current>')
    .option('--dry-run', 'Preview what would change without applying')
    .action(async (target: string, current: string, opts: { dryRun?: boolean }) => {
      if (opts.dryRun) {
        console.log(`[dry-run] Would roll back "${current}" to "${target}".`);
        return;
      }
      const result = await rollbackSnapshot(target, current);
      if (result.success) {
        console.log(`✔ ${result.message}`);
        const prevKeys = Object.keys(result.previousVars);
        if (prevKeys.length > 0) {
          console.log(`  Previous snapshot had ${prevKeys.length} variable(s).`);
        }
      } else {
        console.error(`✖ ${result.message}`);
        process.exit(1);
      }
    });

  rollback
    .command('history <name>')
    .description('List snapshots that <name> has been rolled back to')
    .action(async (name: string) => {
      const targets = await listRollbackTargets(name);
      if (targets.length === 0) {
        console.log(`No rollback history found for "${name}".`);
      } else {
        console.log(`Rollback targets for "${name}":`);
        targets.forEach((t) => console.log(`  - ${t}`));
      }
    });

  rollback
    .command('list')
    .description('List all available snapshots that can be used as rollback targets')
    .action(async () => {
      const snaps = await listSnapshots();
      if (snaps.length === 0) {
        console.log('No snapshots available.');
      } else {
        console.log('Available rollback targets:');
        snaps.forEach((s) => console.log(`  - ${s}`));
      }
    });
}
