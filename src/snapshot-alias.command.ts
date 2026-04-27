import { Command } from 'commander';
import { setAlias, removeAlias, listAliases, resolveAlias } from './snapshot-alias';

export function registerSnapshotAliasCommand(program: Command): void {
  const aliasCmd = program
    .command('alias')
    .description('Manage snapshot aliases');

  aliasCmd
    .command('set <name> <target>')
    .description('Create or update an alias pointing to a snapshot')
    .action(async (name: string, target: string) => {
      await setAlias(name, target);
      console.log(`Alias "${name}" -> "${target}" saved.`);
    });

  aliasCmd
    .command('remove <name>')
    .description('Remove an alias')
    .action(async (name: string) => {
      await removeAlias(name);
      console.log(`Alias "${name}" removed.`);
    });

  aliasCmd
    .command('list')
    .description('List all aliases')
    .action(async () => {
      const aliases = await listAliases();
      const entries = Object.entries(aliases);
      if (entries.length === 0) {
        console.log('No aliases defined.');
        return;
      }
      for (const [name, target] of entries) {
        console.log(`${name} -> ${target}`);
      }
    });

  aliasCmd
    .command('resolve <name>')
    .description('Resolve an alias to its snapshot name')
    .action(async (name: string) => {
      const resolved = await resolveAlias(name);
      if (!resolved) {
        console.error(`Alias "${name}" not found.`);
        return;
      }
      console.log(resolved);
    });
}
