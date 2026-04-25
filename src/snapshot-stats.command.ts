import { Command } from 'commander';
import { getStatsForSnapshot, getAggregateStats } from './snapshot-stats';

function pad(label: string, width = 22): string {
  return label.padEnd(width);
}

export function registerSnapshotStatsCommand(program: Command): void {
  const cmd = program.command('stats').description('Show statistics for snapshots');

  cmd
    .command('show <name>')
    .description('Show stats for a single snapshot')
    .action(async (name: string) => {
      try {
        const stats = await getStatsForSnapshot(name);
        console.log(`\nSnapshot: ${stats.name}`);
        console.log(`${pad('Created at:')}${stats.createdAt}`);
        console.log(`${pad('Total keys:')}${stats.keyCount}`);
        console.log(`${pad('Empty values:')}${stats.hasEmptyValues}`);
        console.log(`${pad('Longest key:')}${stats.longestKey || '(none)'}`);
        console.log(`${pad('Longest value:')}${stats.longestValue ? `${stats.longestValue.slice(0, 40)}...` : '(none)'}`);
      } catch (err: any) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
      }
    });

  cmd
    .command('summary')
    .description('Show aggregate stats across all snapshots')
    .action(async () => {
      try {
        const stats = await getAggregateStats();
        if (stats.totalSnapshots === 0) {
          console.log('No snapshots found.');
          return;
        }
        console.log(`\nAggregate Snapshot Statistics`);
        console.log(`${pad('Total snapshots:')}${stats.totalSnapshots}`);
        console.log(`${pad('Total keys:')}${stats.totalKeys}`);
        console.log(`${pad('Average keys:')}${stats.averageKeys}`);
        console.log(`${pad('Most keys:')}${stats.mostKeys.name} (${stats.mostKeys.count})`);
        console.log(`${pad('Fewest keys:')}${stats.fewestKeys.name} (${stats.fewestKeys.count})`);
      } catch (err: any) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
      }
    });
}
