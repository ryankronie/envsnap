import fs from 'fs';
import path from 'path';
import os from 'os';
import { watchEnvFile } from './watch';
import { listSnapshots, loadSnapshot } from './snapshot';

const tmpDir = path.join(os.tmpdir(), 'envsnap-watch-int-' + process.pid);
const envFile = path.join(tmpDir, '.env');

beforeAll(() => {
  fs.mkdirSync(tmpDir, { recursive: true });
  process.env.ENVSNAP_DIR = path.join(tmpDir, 'snapshots');
});

afterAll(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
  delete process.env.ENVSNAP_DIR;
});

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

test('full watch cycle: write -> detect -> snapshot -> list', async () => {
  fs.writeFileSync(envFile, 'START=0\n');
  const savedNames: string[] = [];

  const handle = watchEnvFile({
    snapshotName: 'integration',
    envFile,
    interval: 100,
    onChange: (n) => savedNames.push(n),
  });

  await sleep(150);
  fs.writeFileSync(envFile, 'DB_HOST=localhost\nDB_PORT=5432\n');
  await sleep(300);
  handle.stop();

  expect(savedNames.length).toBeGreaterThanOrEqual(1);

  const all = listSnapshots();
  const found = all.filter(n => n.startsWith('integration-'));
  expect(found.length).toBeGreaterThanOrEqual(1);

  const snap = loadSnapshot(savedNames[0]);
  expect(snap).toMatchObject({ DB_HOST: 'localhost', DB_PORT: '5432' });
});
