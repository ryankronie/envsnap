import { Command } from 'commander';
import {
  addBookmark,
  removeBookmark,
  listBookmarks,
  getBookmark,
} from './snapshot-bookmark';

export function registerSnapshotBookmarkCommand(program: Command): void {
  const bookmark = program
    .command('bookmark')
    .description('Manage named bookmarks pointing to snapshots');

  bookmark
    .command('add <name> <snapshotId>')
    .description('Create a bookmark for a snapshot')
    .option('-d, --description <desc>', 'Optional description')
    .action((name: string, snapshotId: string, opts: { description?: string }) => {
      try {
        const bm = addBookmark(name, snapshotId, opts.description);
        console.log(`Bookmark "${bm.name}" created for snapshot "${bm.snapshotId}".`);
      } catch (err: any) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
      }
    });

  bookmark
    .command('remove <name>')
    .description('Delete a bookmark by name')
    .action((name: string) => {
      try {
        removeBookmark(name);
        console.log(`Bookmark "${name}" removed.`);
      } catch (err: any) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
      }
    });

  bookmark
    .command('list')
    .description('List all bookmarks')
    .action(() => {
      const bookmarks = listBookmarks();
      if (bookmarks.length === 0) {
        console.log('No bookmarks found.');
        return;
      }
      bookmarks.forEach((bm) => {
        const desc = bm.description ? ` — ${bm.description}` : '';
        console.log(`  ${bm.name} -> ${bm.snapshotId}${desc}`);
      });
    });

  bookmark
    .command('show <name>')
    .description('Show details of a specific bookmark')
    .action((name: string) => {
      const bm = getBookmark(name);
      if (!bm) {
        console.error(`Bookmark "${name}" not found.`);
        process.exit(1);
      }
      console.log(`Name:        ${bm.name}`);
      console.log(`Snapshot ID: ${bm.snapshotId}`);
      console.log(`Created:     ${bm.createdAt}`);
      if (bm.description) console.log(`Description: ${bm.description}`);
    });
}
