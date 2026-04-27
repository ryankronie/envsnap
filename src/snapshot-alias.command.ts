import { Command } from 'commander';
import { setAlias, removeAlias, listAliases, resolveAlias } from './snapshot-alias';

export function registerSnapshotAliasCommand(program: Command): void {
  const alias = program
    .command('alias')
    .description('Manage snapshot aliases');

  alias
    .command('set <alias> <snapshot>')
    .description('Assign an alias to a snapshot name')
    .action((aliasName: string, snapshotName: string) => {
      setAlias(aliasName, snapshotName);
      console.log(`Alias "${aliasName}" -> "${snapshotName}" saved.`);
    });

  alias
    .command('remove <alias>')
    .description('Remove an alias')
    .action((aliasName: string) => {
      const removed = removeAlias(aliasName);
      if (removed) {
        console.log(`Alias "${aliasName}" removed.`);
      } else {
        console.error(`Alias "${aliasName}" not found.`);
        process.exitCode = 1;
      }
    });

  alias
    .command('resolve <alias>')
    .description('Resolve an alias to its snapshot name')
    .action((aliasName: string) => {
      const resolved = resolveAlias(aliasName);
      if (resolved === aliasName) {
        console.log(`"${aliasName}" is not an alias (no mapping found).`);
      } else {
        console.log(resolved);
      }
    });

  alias
    .command('list')
    .description('List all aliases')
    .action(() => {
      const entries = listAliases();
      if (entries.length === 0) {
        console.log('No aliases defined.');
        return;
      }
      const maxLen = Math.max(...entries.map(e => e.alias.length));
      for (const { alias: a, snapshot } of entries) {
        console.log(`${a.padEnd(maxLen)}  ->  ${snapshot}`);
      }
    });
}
