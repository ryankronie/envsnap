import { Command } from 'commander';
import { restoreSnapshot } from './restore';

export function registerRestoreCommand(program: Command): void {
  program
    .command('restore <name>')
    .description('Restore a snapshot to a .env file or current process environment')
    .option('-f, --file <path>', 'Target .env file to write restored variables to')
    .option('--overwrite', 'Overwrite target file if it already exists', false)
    .option(
      '-k, --keys <keys>',
      'Comma-separated list of keys to restore (default: all)',
      (val: string) => val.split(',').map((k) => k.trim())
    )
    .action(
      (
        name: string,
        options: { file?: string; overwrite: boolean; keys?: string[] }
      ) => {
        try {
          const restored = restoreSnapshot(name, {
            targetFile: options.file,
            overwrite: options.overwrite,
            keys: options.keys,
          });

          const count = Object.keys(restored).length;

          if (count === 0) {
            console.warn(`⚠ No variables were restored from "${name}".`);
            return;
          }

          if (options.file) {
            console.log(
              `✔ Restored ${count} variable(s) from "${name}" to ${options.file}`
            );
          } else {
            console.log(
              `✔ Restored ${count} variable(s) from "${name}" into current process`
            );
          }
        } catch (err: any) {
          console.error(`✖ Restore failed: ${err.message}`);
          process.exit(1);
        }
      }
    );
}
