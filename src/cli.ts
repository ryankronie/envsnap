#!/usr/bin/env node
import { Command } from 'commander';
import { saveSnapshot, loadSnapshot, listSnapshots, deleteSnapshot } from './snapshot';

const program = new Command();

program
  .name('envsnap')
  .description('Snapshot and restore local environment variables across projects')
  .version('1.0.0');

program
  .command('save <name>')
  .description('Save current environment variables as a named snapshot')
  .option('-e, --env <keys...>', 'specific env keys to snapshot (defaults to all)')
  .action((name: string, options: { env?: string[] }) => {
    const vars = options.env
      ? Object.fromEntries(options.env.map((k) => [k, process.env[k] ?? '']))
      : { ...process.env };
    saveSnapshot(name, vars);
    console.log(`Snapshot "${name}" saved with ${Object.keys(vars).length} variable(s).`);
  });

program
  .command('restore <name>')
  .description('Print export commands to restore a snapshot')
  .option('--shell <type>', 'shell type: bash | fish', 'bash')
  .action((name: string, options: { shell: string }) => {
    try {
      const snap = loadSnapshot(name);
      const entries = Object.entries(snap);
      if (entries.length === 0) {
        console.log('# No variables found in snapshot.');
        return;
      }
      for (const [key, value] of entries) {
        if (options.shell === 'fish') {
          console.log(`set -x ${key} "${value}"`);
        } else {
          console.log(`export ${key}="${value}"`);
        }
      }
    } catch (err) {
      console.error(`Error: snapshot "${name}" not found.`);
      process.exit(1);
    }
  });

program
  .command('list')
  .description('List all saved snapshots')
  .action(() => {
    const snapshots = listSnapshots();
    if (snapshots.length === 0) {
      console.log('No snapshots found.');
    } else {
      snapshots.forEach((s) => console.log(`  - ${s}`));
    }
  });

program
  .command('delete <name>')
  .description('Delete a named snapshot')
  .action((name: string) => {
    try {
      deleteSnapshot(name);
      console.log(`Snapshot "${name}" deleted.`);
    } catch (err) {
      console.error(`Error: snapshot "${name}" not found.`);
      process.exit(1);
    }
  });

program.parse(process.argv);
