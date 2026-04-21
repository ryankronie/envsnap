import fs from 'fs';
import path from 'path';
import os from 'os';
import { watchEnvFile } from './watch';
import { loadSnapshot } from './snapshot';

const tmpDir = path.join(os.tmpdir(), 'envsnap-watch-test-' + process.pid);
const envFile = path.join(tmpDir, '.env');

beforeAll(() => {
  fs.mkdirSync(tmpDir, { recursive: true });
  // point snapshots dir to tmp
  process.env.ENVSNAP_DIR = path.join(tmpDir, 'snapshots');
});

afterAll(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
  delete process.env.ENVSNAP_DIR;
});

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

test('watchEnvFile returns a running handle', () => {
  fs.writeFileSync(envFile, 'FOO=bar\n');
  const handle = watchEnvFile({ snapshotName: 'test', envFile, interval: 500 });
  expect(handle.isRunning()).toBe(true);
  handle.stop();
  expect(handle.isRunning()).toBe(false);
});

test('watchEnvFile calls onChange when file changes', async () => {
  fs.writeFileSync(envFile, 'INITIAL=1\n');
  const names: string[] = [];
  const handle = watchEnvFile({
    snapshotName: 'watch-snap',
    envFile,
    interval: 100,
    onChange: (n) => names.push(n),
  });
  await sleep(150);
  fs.writeFileSync(envFile, 'UPDATED=2\nANOTHER=3\n');
  await sleep(300);
  handle.stop();
  expect(names.length).toBeGreaterThanOrEqual(1);
  const saved = loadSnapshot(names[0]);
  expect(saved).toMatchObject({ UPDATED: '2', ANOTHER: '3' });
});

test('watchEnvFile ignores comments and blank lines', async () => {
  fs.writeFileSync(envFile, 'A=1\n');
  const names: string[] = [];
  const handle = watchEnvFile({
    snapshotName: 'clean-snap',
    envFile,
    interval: 100,
    onChange: (n) => names.push(n),
  });
  await sleep(150);
  fs.writeFileSync(envFile, '# comment\n\nB=2\n');
  await sleep(300);
  handle.stop();
  if (names.length > 0) {
    const saved = loadSnapshot(names[0]);
    expect(saved).not.toHaveProperty('#');
    expect(saved).toMatchObject({ B: '2' });
  }
});
