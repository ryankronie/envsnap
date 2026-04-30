import { Command } from 'commander';
import {
  setComment,
  removeComment,
  getComment,
  listComments,
} from './snapshot-comment';

export function registerSnapshotCommentCommand(program: Command): void {
  const cmd = program
    .command('comment')
    .description('Manage comments on snapshots');

  cmd
    .command('set <snapshot> <text>')
    .description('Set or update a comment on a snapshot')
    .action((snapshot: string, text: string) => {
      const entry = setComment(snapshot, text);
      console.log(`Comment set on "${snapshot}": ${entry.text}`);
    });

  cmd
    .command('get <snapshot>')
    .description('Get the comment for a snapshot')
    .action((snapshot: string) => {
      const entry = getComment(snapshot);
      if (!entry) {
        console.log(`No comment found for "${snapshot}".`);
        return;
      }
      console.log(`Comment: ${entry.text}`);
      console.log(`Created: ${entry.createdAt}`);
      console.log(`Updated: ${entry.updatedAt}`);
    });

  cmd
    .command('remove <snapshot>')
    .description('Remove the comment from a snapshot')
    .action((snapshot: string) => {
      const removed = removeComment(snapshot);
      if (removed) {
        console.log(`Comment removed from "${snapshot}".`);
      } else {
        console.log(`No comment found for "${snapshot}".`);
      }
    });

  cmd
    .command('list')
    .description('List all snapshot comments')
    .action(() => {
      const entries = listComments();
      if (entries.length === 0) {
        console.log('No comments found.');
        return;
      }
      for (const { name, text, updatedAt } of entries) {
        console.log(`  ${name}: "${text}" (updated: ${updatedAt})`);
      }
    });
}
