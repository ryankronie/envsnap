import { Command } from 'commander';
import { saveTemplate, loadTemplate, listTemplates, deleteTemplate } from './template';
import { loadSnapshot } from './snapshot';
import { saveSnapshot } from './snapshot';

export function registerTemplateCommand(program: Command): void {
  const cmd = program.command('template').description('Manage env key templates');

  cmd
    .command('save <name> <keys...>')
    .description('Save a named template with the given keys')
    .action((name: string, keys: string[]) => {
      saveTemplate(name, keys);
      console.log(`Template "${name}" saved with keys: ${keys.join(', ')}`);
    });

  cmd
    .command('list')
    .description('List all saved templates')
    .action(() => {
      const templates = listTemplates();
      if (templates.length === 0) {
        console.log('No templates found.');
      } else {
        templates.forEach((t) => console.log(`  - ${t}`));
      }
    });

  cmd
    .command('show <name>')
    .description('Show keys in a template')
    .action((name: string) => {
      const keys = loadTemplate(name);
      console.log(`Template "${name}" keys:\n${keys.map((k) => `  - ${k}`).join('\n')}`);
    });

  cmd
    .command('delete <name>')
    .description('Delete a template')
    .action((name: string) => {
      deleteTemplate(name);
      console.log(`Template "${name}" deleted.`);
    });

  cmd
    .command('apply <templateName> <snapshotName> <newName>')
    .description('Apply a template to a snapshot and save result as a new snapshot')
    .action((templateName: string, snapshotName: string, newName: string) => {
      const keys = loadTemplate(templateName);
      const snapshot = loadSnapshot(snapshotName);
      const filtered: Record<string, string> = {};
      for (const key of keys) {
        if (key in snapshot.env) filtered[key] = snapshot.env[key];
      }
      saveSnapshot(newName, filtered);
      console.log(`Applied template "${templateName}" to "${snapshotName}" → saved as "${newName}".`);
    });
}
