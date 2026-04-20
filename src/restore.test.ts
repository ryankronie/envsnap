import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { restoreToFile, restoreToProcess, restoreSnapshot } from './restore';
import * as snapshot from './snapshot';

jest.mock('./snapshot');

const mockLoadSnapshot = snapshot.loadSnapshot as jest.Mock;

describe('restoreToFile', () => {
  let tmpFile: string;

  beforeEach(() => {
    tmpFile = path.join(os.tmpdir(), `envsnap-restore-test-${Date.now()}.env`);
  });

  afterEach(() => {
    if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
  });

  it('writes env vars to file', () => {
    restoreToFile({ FOO: 'bar', BAZ: '123' }, tmpFile);
    const content = fs.readFileSync(tmpFile, 'utf-8');
    expect(content).toContain('FOO=bar');
    expect(content).toContain('BAZ=123');
  });

  it('throws if file exists and overwrite is false', () => {
    fs.writeFileSync(tmpFile, 'existing');
    expect(() => restoreToFile({ A: '1' }, tmpFile, false)).toThrow(
      /already exists/
    );
  });

  it('overwrites file when overwrite is true', () => {
    fs.writeFileSync(tmpFile, 'old=content');
    restoreToFile({ NEW: 'value' }, tmpFile, true);
    const content = fs.readFileSync(tmpFile, 'utf-8');
    expect(content).toContain('NEW=value');
    expect(content).not.toContain('old=content');
  });
});

describe('restoreToProcess', () => {
  it('sets all env vars when no keys specified', () => {
    restoreToProcess({ TEST_RESTORE_A: 'hello', TEST_RESTORE_B: 'world' });
    expect(process.env.TEST_RESTORE_A).toBe('hello');
    expect(process.env.TEST_RESTORE_B).toBe('world');
  });

  it('sets only specified keys', () => {
    restoreToProcess(
      { TEST_RESTORE_C: 'yes', TEST_RESTORE_D: 'no' },
      ['TEST_RESTORE_C']
    );
    expect(process.env.TEST_RESTORE_C).toBe('yes');
    expect(process.env.TEST_RESTORE_D).toBeUndefined();
  });
});

describe('restoreSnapshot', () => {
  it('loads snapshot and restores to process', () => {
    mockLoadSnapshot.mockReturnValue({ SNAP_KEY: 'snap_val' });
    const result = restoreSnapshot('my-snap');
    expect(result).toEqual({ SNAP_KEY: 'snap_val' });
    expect(process.env.SNAP_KEY).toBe('snap_val');
  });

  it('filters keys when keys option provided', () => {
    mockLoadSnapshot.mockReturnValue({ A: '1', B: '2', C: '3' });
    const result = restoreSnapshot('my-snap', { keys: ['A', 'C'] });
    expect(result).toEqual({ A: '1', C: '3' });
  });
});
