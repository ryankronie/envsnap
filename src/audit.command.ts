import { Command } from 'commander';
import { loadAuditLog, getAuditForSnapshot, clearAuditLog } from './audit';
import { AuditEntry } from './audit';

function formatEntry(e: AuditEntry): string {
  const ts = new Date(e.timestamp).toLocaleString();
  const detail = e.details ? ` (${e.details})` : '';
  return `[${ts}] ${e.action.toUpperCase().padEnd(8)} ${e.snapshotName} — ${e.user}${detail}`;
}

export function registerAuditCommand(program: Command): void {
  const audit = program
    .command('audit')
    .description('View or manage the audit log');

  audit
    .command('list')
    .description('List all audit entries')
    .option('-n, --snapshot <name>', 'Filter by snapshot name')
    .option('--limit <number>', 'Limit number of results', '20')
    .action((opts) => {
      const limit = parseInt(opts.limit, 10);
      const entries = opts.snapshot
        ? getAuditForSnapshot(opts.snapshot)
        : loadAuditLog();
      const slice = entries.slice(-limit);
      if (slice.length === 0) {
        console.log('No audit entries found.');
        return;
      }
      slice.forEach((e) => console.log(formatEntry(e)));
    });

  audit
    .command('clear')
    .description('Clear the entire audit log')
    .action(() => {
      clearAuditLog();
      console.log('Audit log cleared.');
    });
}
