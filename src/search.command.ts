import { Command } from 'commander';
import { searchByKey, searchByValue } from './search';
import { formatSummary } from './format';

export function registerSearchCommand(program: Command): void {
  const search = program
    .command('search')
    .description('Search snapshots by key or value');

  search
    .command('key <pattern>')
    .description('Find snapshots containing a key matching the pattern')
    .option('--mask', 'Mask values in output', false)
    .action((pattern: string, opts: { mask: boolean }) => {
      const results = searchByKey(pattern);
      if (results.length === 0) {
        console.log(`No snapshots found with key matching "${pattern}"`);
        return;
      }
      for (const { snapshotName, matches } of results) {
        console.log(`\nSnapshot: ${snapshotName}`);
        console.log(formatSummary(matches, opts.mask));
      }
    });

  search
    .command('value <pattern>')
    .description('Find snapshots containing a value matching the pattern')
    .option('--mask', 'Mask values in output', false)
    .action((pattern: string, opts: { mask: boolean }) => {
      const results = searchByValue(pattern);
      if (results.length === 0) {
        console.log(`No snapshots found with value matching "${pattern}"`);
        return;
      }
      for (const { snapshotName, matches } of results) {
        console.log(`\nSnapshot: ${snapshotName}`);
        console.log(formatSummary(matches, opts.mask));
      }
    });
}
