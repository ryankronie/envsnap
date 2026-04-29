import * as fs from 'fs';
import * as path from 'path';
import {
  categoryFilePath,
  loadCategories,
  saveCategories,
  setCategory,
  removeCategory,
  getCategory,
  listByCategory,
  listAllCategories,
} from './snapshot-category';

function cleanup() {
  const file = categoryFilePath();
  if (fs.existsSync(file)) fs.unlinkSync(file);
}

beforeEach(cleanup);
afterAll(cleanup);

describe('loadCategories', () => {
  it('returns empty object when file does not exist', () => {
    expect(loadCategories()).toEqual({});
  });

  it('returns parsed categories from file', () => {
    saveCategories({ snap1: 'production' });
    expect(loadCategories()).toEqual({ snap1: 'production' });
  });
});

describe('setCategory / getCategory', () => {
  it('sets and retrieves a category for a snapshot', () => {
    setCategory('snap1', 'staging');
    expect(getCategory('snap1')).toBe('staging');
  });

  it('returns undefined for uncategorised snapshot', () => {
    expect(getCategory('unknown')).toBeUndefined();
  });
});

describe('removeCategory', () => {
  it('removes a category from a snapshot', () => {
    setCategory('snap1', 'dev');
    removeCategory('snap1');
    expect(getCategory('snap1')).toBeUndefined();
  });
});

describe('listByCategory', () => {
  it('returns snapshots belonging to a category', () => {
    setCategory('snap1', 'production');
    setCategory('snap2', 'staging');
    setCategory('snap3', 'production');
    expect(listByCategory('production').sort()).toEqual(['snap1', 'snap3']);
  });
});

describe('listAllCategories', () => {
  it('returns unique sorted category names', () => {
    setCategory('snap1', 'production');
    setCategory('snap2', 'staging');
    setCategory('snap3', 'production');
    expect(listAllCategories()).toEqual(['production', 'staging']);
  });
});
