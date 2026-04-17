import * as fs from 'fs';
import * as path from 'path';
import { pinSnapshot, unpinSnapshot, isPinned, listPinned, loadPins } from './pin';

const PINS_FILE = '.envsnap/pins.json';
const SNAPSHOTS_DIR = '.envsnap';

function cleanup() {
  if (fs.existsSync(PINS_FILE)) fs.unlinkSync(PINS_FILE);
  if (fs.existsSync(SNAPSHOTS_DIR)) fs.rmdirSync(SNAPSHOTS_DIR, { recursive: true });
}

beforeEach(cleanup);
afterAll(cleanup);

describe('pinSnapshot', () => {
  it('pins a snapshot by name', () => {
    pinSnapshot('dev');
    expect(isPinned('dev')).toBe(true);
  });

  it('throws if already pinned', () => {
    pinSnapshot('dev');
    expect(() => pinSnapshot('dev')).toThrow('already pinned');
  });
});

describe('unpinSnapshot', () => {
  it('unpins a pinned snapshot', () => {
    pinSnapshot('dev');
    unpinSnapshot('dev');
    expect(isPinned('dev')).toBe(false);
  });

  it('throws if not pinned', () => {
    expect(() => unpinSnapshot('missing')).toThrow('not pinned');
  });
});

describe('listPinned', () => {
  it('returns empty array when no pins', () => {
    expect(listPinned()).toEqual([]);
  });

  it('returns all pinned snapshots', () => {
    pinSnapshot('alpha');
    pinSnapshot('beta');
    expect(listPinned()).toEqual(['alpha', 'beta']);
  });
});

describe('isPinned', () => {
  it('returns false for unpinned snapshot', () => {
    expect(isPinned('nope')).toBe(false);
  });
});
