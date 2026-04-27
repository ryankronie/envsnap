import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import {
  loadAliases,
  saveAliases,
  setAlias,
  removeAlias,
  resolveAlias,
  getAliasesForSnapshot,
  listAliases,
} from './snapshot-alias';

const aliasFile = path.join(os.homedir(), '.envsnap', 'aliases.json');

function cleanup() {
  if (fs.existsSync(aliasFile)) fs.unlinkSync(aliasFile);
}

beforeEach(cleanup);
afterAll(cleanup);

describe('loadAliases', () => {
  it('returns empty object when file does not exist', () => {
    expect(loadAliases()).toEqual({});
  });
});

describe('setAlias / loadAliases', () => {
  it('persists an alias', () => {
    setAlias('prod', 'production-2024');
    expect(loadAliases()).toEqual({ prod: 'production-2024' });
  });

  it('overwrites existing alias', () => {
    setAlias('prod', 'production-2024');
    setAlias('prod', 'production-2025');
    expect(loadAliases()['prod']).toBe('production-2025');
  });
});

describe('removeAlias', () => {
  it('removes an existing alias and returns true', () => {
    setAlias('staging', 'staging-snap');
    expect(removeAlias('staging')).toBe(true);
    expect(loadAliases()['staging']).toBeUndefined();
  });

  it('returns false when alias does not exist', () => {
    expect(removeAlias('nonexistent')).toBe(false);
  });
});

describe('resolveAlias', () => {
  it('resolves a known alias to snapshot name', () => {
    setAlias('dev', 'dev-snapshot-v1');
    expect(resolveAlias('dev')).toBe('dev-snapshot-v1');
  });

  it('returns the input unchanged when not an alias', () => {
    expect(resolveAlias('unknown-alias')).toBe('unknown-alias');
  });
});

describe('getAliasesForSnapshot', () => {
  it('returns all aliases pointing to a snapshot', () => {
    setAlias('a1', 'snap-x');
    setAlias('a2', 'snap-x');
    setAlias('a3', 'snap-y');
    const result = getAliasesForSnapshot('snap-x');
    expect(result).toContain('a1');
    expect(result).toContain('a2');
    expect(result).not.toContain('a3');
  });
});

describe('listAliases', () => {
  it('returns all alias entries as array', () => {
    setAlias('foo', 'foo-snap');
    setAlias('bar', 'bar-snap');
    const list = listAliases();
    expect(list).toContainEqual({ alias: 'foo', snapshot: 'foo-snap' });
    expect(list).toContainEqual({ alias: 'bar', snapshot: 'bar-snap' });
  });
});
