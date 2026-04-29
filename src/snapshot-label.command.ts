import { Command } from 'commander';
import {
  addLabel,
  removeLabel,
  getLabels,
  getSnapshotsByLabel,
  clearLabels,
} from './snapshot-label';

export function registerSnapshotLabelCommand(program: Command): void {
  const label = program
    .command('label')
    .description('Manage labels for snapshots');

  label
    .command('add <snapshot> <label>')
    .description('Add a label to a snapshot')
    .action((snapshot: string, lbl: string) => {
      addLabel(snapshot, lbl);
      console.log(`Label "${lbl}" added to snapshot "${snapshot}".`);
    });

  label
    .command('remove <snapshot> <label>')
    .description('Remove a label from a snapshot')
    .action((snapshot: string, lbl: string) => {
      removeLabel(snapshot, lbl);
      console.log(`Label "${lbl}" removed from snapshot "${snapshot}".`);
    });

  label
    .command('list <snapshot>')
    .description('List all labels for a snapshot')
    .action((snapshot: string) => {
      const labels = getLabels(snapshot);
      if (labels.length === 0) {
        console.log(`No labels for snapshot "${snapshot}".`);
      } else {
        console.log(`Labels for "${snapshot}": ${labels.join(', ')}`);
      }
    });

  label
    .command('find <label>')
    .description('Find all snapshots with a given label')
    .action((lbl: string) => {
      const snaps = getSnapshotsByLabel(lbl);
      if (snaps.length === 0) {
        console.log(`No snapshots found with label "${lbl}".`);
      } else {
        console.log(`Snapshots with label "${lbl}":\n${snaps.join('\n')}`);
      }
    });

  label
    .command('clear <snapshot>')
    .description('Clear all labels from a snapshot')
    .action((snapshot: string) => {
      clearLabels(snapshot);
      console.log(`All labels cleared from snapshot "${snapshot}".`);
    });
}
