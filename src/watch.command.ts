import { Command } from 'commander';
import { watchEnvFile } from './watch';

export function registerWatchCommand(program: Command): void {
  program
    .command('watch <name>')
    .description('Watch an env file and auto-snapshot on changes')
    .option('-f, --file <path>', 'Path to env file to watch', '.env')
    .option('-i, --interval <ms>', 'Poll interval in milliseconds', '2000')
    .action((name: string, opts: { file: string; interval: string }) => {
      const interval = parseInt(opts.interval, 10);
      if (isNaN(interval) || interval < 100) {
        console.error('Interval must be a number >= 100ms');
        process.exit(1);
      }

      console.log(`Watching ${opts.file} — snapshots will be saved as ${name}-<timestamp>`);
      console.log('Press Ctrl+C to stop.\n');

      const handle = watchEnvFile({
        snapshotName: name,
        envFile: opts.file,
        interval,
        onChange: (savedName) => {
          const ts = new Date().toISOString();
          console.log(`[${ts}] Change detected — saved snapshot: ${savedName}`);
        },
      });

      process.on('SIGINT', () => {
        handle.stop();
        console.log('\nWatch stopped.');
        process.exit(0);
      });
    });
}
