import { execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

const CLI = path.resolve(__dirname, '../src/cli.ts');
const run = (args: string, env?: NodeJS.ProcessEnv) =>
  execSync(`ts-node ${CLI} ${args}`, {
    encoding: 'utf8',
    env: { ...process.env, ENVSNAP_DIR: testDir, ...env },
  }).trim();

let testDir: string;

beforeEach(() => {
  testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'envsnap-cli-'));
});

afterEach(() => {
  fs.rmSync(testDir, { recursive: true, force: true });
});

describe('cli save + list + delete', () => {
  it('saves a snapshot and lists it', () => {
    run('save mysnap -e PATH HOME', { PATH: '/usr/bin', HOME: '/home/user' });
    const output = run('list');
    expect(output).toContain('mysnap');
  });

  it('deletes a snapshot', () => {
    run('save todelete -e PATH', { PATH: '/usr/bin' });
    run('delete todelete');
    const output = run('list');
    expect(output).not.toContain('todelete');
  });
});

describe('cli restore', () => {
  it('prints bash export statements', () => {
    run('save bashsnap -e MY_VAR', { MY_VAR: 'hello' });
    const output = run('restore bashsnap --shell bash');
    expect(output).toContain('export MY_VAR="hello"');
  });

  it('prints fish set statements', () => {
    run('save fishsnap -e MY_VAR', { MY_VAR: 'world' });
    const output = run('restore fishsnap --shell fish');
    expect(output).toContain('set -x MY_VAR "world"');
  });
});
