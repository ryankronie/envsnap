import { Command } from 'commander';
import { exportSnapshot, ExportFormat } from './export';
import * as path from 'path';

export function registerExportCommand(program: Command): void {
  program
    .command('export <name>')
    .description('Export a snapshot to a file or stdout')
    .option('-f, --format <format>', 'Output format: dotenv | shell | json', 'dotenv')
    .option('-o, --output <path>', 'Write output to a file instead of stdout')
    .action(async (name: string, options: { format: string; output?: string }) => {
      const format = options.format as ExportFormat;
      const validFormats: ExportFormat[] = ['dotenv', 'shell', 'json'];
      if (!validFormats.includes(format)) {
        console.error(`Invalid format "${format}". Choose from: ${validFormats.join(', ')}`);
        process.exit(1);
      }
      try {
        const content = await exportSnapshot(name, format, options.output);
        if (options.output) {
          console.log(`Exported snapshot "${name}" to ${path.resolve(options.output)}`);
        } else {
          process.stdout.write(content);
        }
      } catch (err: any) {
        console.error(`Error exporting snapshot: ${err.message}`);
        process.exit(1);
      }
    });
}
