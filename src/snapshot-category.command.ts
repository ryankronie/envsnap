import { Command } from 'commander';
import {
  setCategory,
  removeCategory,
  getCategory,
  listByCategory,
  listAllCategories,
} from './snapshot-category';

export function registerSnapshotCategoryCommand(program: Command): void {
  const cat = program
    .command('category')
    .description('Manage snapshot categories');

  cat
    .command('set <snapshot> <category>')
    .description('Assign a category to a snapshot')
    .action((snapshot: string, category: string) => {
      setCategory(snapshot, category);
      console.log(`Category "${category}" assigned to snapshot "${snapshot}".`);
    });

  cat
    .command('get <snapshot>')
    .description('Show the category of a snapshot')
    .action((snapshot: string) => {
      const category = getCategory(snapshot);
      if (category) {
        console.log(`${snapshot}: ${category}`);
      } else {
        console.log(`No category assigned to "${snapshot}".`);
      }
    });

  cat
    .command('remove <snapshot>')
    .description('Remove the category from a snapshot')
    .action((snapshot: string) => {
      removeCategory(snapshot);
      console.log(`Category removed from "${snapshot}".`);
    });

  cat
    .command('list [category]')
    .description('List snapshots in a category, or all categories if none given')
    .action((category?: string) => {
      if (category) {
        const snaps = listByCategory(category);
        if (snaps.length === 0) {
          console.log(`No snapshots in category "${category}".`);
        } else {
          snaps.forEach((s) => console.log(s));
        }
      } else {
        const cats = listAllCategories();
        if (cats.length === 0) {
          console.log('No categories defined.');
        } else {
          cats.forEach((c) => console.log(c));
        }
      }
    });
}
