import { Command } from 'commander';
import {
  setPriority,
  removePriority,
  getPriority,
  listByPriority,
  PriorityLevel,
  PRIORITY_ORDER,
} from './snapshot-priority';

const VALID_LEVELS = Object.keys(PRIORITY_ORDER) as PriorityLevel[];

export function registerSnapshotPriorityCommand(program: Command): void {
  const cmd = program.command('priority').description('Manage snapshot priorities');

  cmd
    .command('set <snapshot> <level>')
    .description(`Set priority for a snapshot (${VALID_LEVELS.join(', ')})`)
    .action((snapshot: string, level: string) => {
      if (!VALID_LEVELS.includes(level as PriorityLevel)) {
        console.error(`Invalid priority level: ${level}. Must be one of: ${VALID_LEVELS.join(', ')}`);
        process.exit(1);
      }
      setPriority(snapshot, level as PriorityLevel);
      console.log(`Priority for "${snapshot}" set to "${level}".`);
    });

  cmd
    .command('get <snapshot>')
    .description('Get priority for a snapshot')
    .action((snapshot: string) => {
      const level = getPriority(snapshot);
      console.log(`${snapshot}: ${level}`);
    });

  cmd
    .command('remove <snapshot>')
    .description('Remove priority override for a snapshot')
    .action((snapshot: string) => {
      removePriority(snapshot);
      console.log(`Priority for "${snapshot}" removed (reset to normal).`);
    });

  cmd
    .command('list [level]')
    .description('List snapshots by priority level')
    .action((level?: string) => {
      if (level) {
        if (!VALID_LEVELS.includes(level as PriorityLevel)) {
          console.error(`Invalid priority level: ${level}`);
          process.exit(1);
        }
        const snaps = listByPriority(level as PriorityLevel);
        if (snaps.length === 0) {
          console.log(`No snapshots with priority "${level}".`);
        } else {
          snaps.forEach((s) => console.log(`  ${s}`));
        }
      } else {
        VALID_LEVELS.forEach((lvl) => {
          const snaps = listByPriority(lvl);
          if (snaps.length > 0) {
            console.log(`[${lvl}]`);
            snaps.forEach((s) => console.log(`  ${s}`));
          }
        });
      }
    });
}
