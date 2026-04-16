import type { Command } from 'commander';
import * as path from 'path';
import { addTag, removeTag, getTagsForSnapshot, getSnapshotsForTag } from './tag';

const SNAPSHOTS_DIR = path.join(process.env.HOME || '.', '.envsnap');

export function registerTagCommand(program: Command): void {
  const tag = program
    .command('tag')
    .description('Manage tags for snapshots');

  tag
    .command('add <snapshot> <tag>')
    .description('Add a tag to a snapshot')
    .action((snapshot: string, tagName: string) => {
      addTag(SNAPSHOTS_DIR, snapshot, tagName);
      console.log(`Tagged "${snapshot}" with "${tagName}"`);
    });

  tag
    .command('remove <snapshot> <tag>')
    .description('Remove a tag from a snapshot')
    .action((snapshot: string, tagName: string) => {
      removeTag(SNAPSHOTS_DIR, snapshot, tagName);
      console.log(`Removed tag "${tagName}" from "${snapshot}"`);
    });

  tag
    .command('list <snapshot>')
    .description('List tags for a snapshot')
    .action((snapshot: string) => {
      const tags = getTagsForSnapshot(SNAPSHOTS_DIR, snapshot);
      if (tags.length === 0) {
        console.log(`No tags for "${snapshot}"`);
      } else {
        console.log(`Tags for "${snapshot}": ${tags.join(', ')}`);
      }
    });

  tag
    .command('find <tag>')
    .description('Find all snapshots with a given tag')
    .action((tagName: string) => {
      const snaps = getSnapshotsForTag(SNAPSHOTS_DIR, tagName);
      if (snaps.length === 0) {
        console.log(`No snapshots tagged with "${tagName}"`);
      } else {
        console.log(`Snapshots tagged "${tagName}":`);
        snaps.forEach(s => console.log(`  - ${s}`));
      }
    });
}
