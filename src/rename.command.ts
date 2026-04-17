import { Command } from 'commander';
import { renameSnapshot, copySnapshot } from './rename';

export function registerRenameCommand(program: Command): void {
  program
    .command('rename <oldName> <newName>')
    .description('Rename a snapshot')
    .action(async (oldName: string, newName: string) => {
      try {
        await renameSnapshot(oldName, newName);
        console.log(`Snapshot "${oldName}" renamed to "${newName}".`);
      } catch (err: any) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
      }
    });

  program
    .command('copy <sourceName> <destName>')
    .description('Copy a snapshot to a new name')
    .action(async (sourceName: string, destName: string) => {
      try {
        await copySnapshot(sourceName, destName);
        console.log(`Snapshot "${sourceName}" copied to "${destName}".`);
      } catch (err: any) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
      }
    });
}
