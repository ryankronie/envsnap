import { Command } from 'commander';
import { loadSnapshot, listSnapshots } from './snapshot';
import { mergeEnvs, previewMerge } from './merge';
import { saveSnapshot } from './snapshot';

export function registerMergeCommand(program: Command): void {
  program
    .command('merge <base> <override>')
    .description('Merge two snapshots into a new snapshot')
    .option('-o, --output <name>', 'Name for the merged snapshot')
    .option('--preview', 'Preview the merge without saving')
    .option('--strategy <strategy>', 'Merge strategy: override or keep-base', 'override')
    .action(async (base: string, override: string, options) => {
      const snapshots = listSnapshots();

      if (!snapshots.includes(base)) {
        console.error(`Snapshot "${base}" not found.`);
        process.exit(1);
      }

      if (!snapshots.includes(override)) {
        console.error(`Snapshot "${override}" not found.`);
        process.exit(1);
      }

      const baseEnv = loadSnapshot(base);
      const overrideEnv = loadSnapshot(override);

      if (options.preview) {
        const preview = previewMerge(baseEnv, overrideEnv);
        console.log(`\nMerge preview (${base} + ${override}):\n`);
        for (const [key, { base: b, override: o, result }] of Object.entries(preview)) {
          if (b !== o) {
            console.log(`  ${key}: "${b ?? '(none)'}" -> "${o ?? '(none)')" => "${result}"`);
          } else {
            console.log(`  ${key}: "${result}" (unchanged)`);
          }
        }
        return;
      }

      const strategy = options.strategy === 'keep-base' ? 'keep-base' : 'override';
      const merged = mergeEnvs(baseEnv, overrideEnv, strategy);

      const outputName = options.output || `${base}-${override}-merged`;
      saveSnapshot(outputName, merged);
      console.log(`Merged snapshot saved as "${outputName}" (${Object.keys(merged).length} variables).`);
    });
}
