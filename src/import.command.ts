import { Command } from 'commander';
import * as path from 'path';
import { importFromFile, ImportFormat } from './import';
import { saveSnapshot } from './snapshot';
import { recordAction } from './history';

export function registerImportCommand(program: Command): void {
  program
    .command('import <file> <snapshot-name>')
    .description('Import environment variables from a file into a named snapshot')
    .option('-f, --format <format>', 'File format: dotenv, shell, or json')
    .option('--merge', 'Merge with existing snapshot instead of overwriting')
    .action(async (file: string, snapshotName: string, opts: { format?: string; merge?: boolean }) => {
      const absPath = path.resolve(file);
      const format = opts.format as ImportFormat | undefined;

      let imported: Record<string, string>;
      try {
        imported = importFromFile(absPath, format);
      } catch (err: any) {
        console.error(`Failed to read file: ${err.message}`);
        process.exit(1);
      }

      const count = Object.keys(imported).length;
      if (count === 0) {
        console.warn('No variables found in file. Snapshot not saved.');
        return;
      }

      let final = imported;
      if (opts.merge) {
        try {
          const { loadSnapshot } = await import('./snapshot');
          const existing = loadSnapshot(snapshotName);
          final = { ...existing.vars, ...imported };
        } catch {
          // snapshot doesn't exist yet, proceed with imported only
        }
      }

      saveSnapshot(snapshotName, final);
      recordAction({ action: 'import', snapshot: snapshotName, detail: absPath });
      console.log(`Imported ${count} variable(s) into snapshot "${snapshotName}".`);
    });
}
