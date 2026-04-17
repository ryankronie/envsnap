import { Command } from 'commander';
import { addSchedule, removeSchedule, loadSchedule, getSchedulesForSnapshot } from './schedule';
import { DEFAULT_SNAPSHOTS_DIR } from './snapshot';

export function registerScheduleCommand(program: Command, dir = DEFAULT_SNAPSHOTS_DIR) {
  program
    .command('schedule <snapshot> <cron>')
    .description('Schedule automatic save for a snapshot (cron syntax)')
    .option('-a, --action <action>', 'Action: save or restore', 'save')
    .action((snapshot: string, cron: string, opts: { action: string }) => {
      const action = opts.action as 'save' | 'restore';
      addSchedule(dir, snapshot, cron, action);
      console.log(`Scheduled ${action} for "${snapshot}" with cron: ${cron}`);
    });

  program
    .command('unschedule <snapshot>')
    .description('Remove schedule for a snapshot')
    .option('-a, --action <action>', 'Action: save or restore', 'save')
    .action((snapshot: string, opts: { action: string }) => {
      const action = opts.action as 'save' | 'restore';
      const removed = removeSchedule(dir, snapshot, action);
      if (removed) {
        console.log(`Removed ${action} schedule for "${snapshot}"`);
      } else {
        console.log(`No ${action} schedule found for "${snapshot}"`);
      }
    });

  program
    .command('schedules [snapshot]')
    .description('List all schedules, or schedules for a specific snapshot')
    .action((snapshot?: string) => {
      const entries = snapshot
        ? getSchedulesForSnapshot(dir, snapshot)
        : loadSchedule(dir);
      if (entries.length === 0) {
        console.log('No schedules found.');
        return;
      }
      entries.forEach(e => {
        console.log(`[${e.action}] ${e.snapshot} — cron: ${e.cron} (created: ${e.createdAt})`);
      });
    });
}
