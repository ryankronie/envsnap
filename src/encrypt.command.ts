import { Command } from 'commander';
import * as readline from 'readline';
import { loadSnapshot, saveSnapshot } from './snapshot';
import { encryptSnapshot, decryptSnapshot, isEncryptedPayload } from './encrypt';

function promptPassphrase(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    process.stdout.write(prompt);
    rl.question('', (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

export function registerEncryptCommand(program: Command): void {
  program
    .command('encrypt <name>')
    .description('Encrypt a saved snapshot with a passphrase')
    .action(async (name: string) => {
      const snapshot = await loadSnapshot(name);
      const passphrase = await promptPassphrase('Enter passphrase: ');
      if (!passphrase) {
        console.error('Passphrase cannot be empty.');
        process.exit(1);
      }
      const encoded = encryptSnapshot(snapshot, passphrase);
      await saveSnapshot(name, { ...snapshot, _encrypted: encoded } as any);
      console.log(`Snapshot "${name}" encrypted successfully.`);
    });

  program
    .command('decrypt <name>')
    .description('Decrypt a snapshot and display its variables')
    .option('--restore', 'Overwrite snapshot with decrypted data')
    .action(async (name: string, opts: { restore?: boolean }) => {
      const raw = await loadSnapshot(name);
      const encoded = (raw as any)._encrypted as string | undefined;
      if (!encoded || !isEncryptedPayload(encoded)) {
        console.error(`Snapshot "${name}" is not encrypted.`);
        process.exit(1);
      }
      const passphrase = await promptPassphrase('Enter passphrase: ');
      try {
        const decrypted = decryptSnapshot(encoded, passphrase);
        if (opts.restore) {
          await saveSnapshot(name, decrypted);
          console.log(`Snapshot "${name}" restored (decrypted).`);
        } else {
          console.log(JSON.stringify(decrypted.env, null, 2));
        }
      } catch {
        console.error('Decryption failed. Wrong passphrase?');
        process.exit(1);
      }
    });
}
