import { Command } from 'commander';
import { loadSnapshot } from './snapshot';
import { lintSnapshot, LintResult } from './lint';

function formatResults(results: LintResult[]): void {
  if (results.length === 0) {
    console.log('✅ No issues found.');
    return;
  }
  console.log(`⚠️  Found ${results.length} issue(s):\n`);
  for (const r of results) {
    console.log(`  [${r.rule}] ${r.message}`);
  }
}

export function registerLintCommand(program: Command): void {
  program
    .command('lint <name>')
    .description('Lint a snapshot for common environment variable issues')
    .option('--fail', 'Exit with non-zero code if issues are found')
    .action(async (name: string, opts: { fail?: boolean }) => {
      let snapshot;
      try {
        snapshot = await loadSnapshot(name);
      } catch {
        console.error(`Snapshot "${name}" not found.`);
        process.exit(1);
      }

      const results = lintSnapshot(snapshot);
      formatResults(results);

      if (opts.fail && results.length > 0) {
        process.exit(1);
      }
    });
}
