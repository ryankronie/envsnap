import * as fs from 'fs';
import * as path from 'path';
import {
  saveTemplate,
  loadTemplate,
  listTemplates,
  deleteTemplate,
  applyTemplate,
} from './template';
import { Snapshot } from './types';

const TEMPLATES_DIR = path.join(process.cwd(), '.envsnap', 'templates');

function cleanup() {
  if (fs.existsSync(TEMPLATES_DIR)) {
    fs.rmSync(TEMPLATES_DIR, { recursive: true, force: true });
  }
}

beforeEach(cleanup);
afterAll(cleanup);

describe('saveTemplate / loadTemplate', () => {
  it('saves and loads a template by name', () => {
    saveTemplate('backend', ['DB_HOST', 'DB_PORT', 'API_KEY']);
    const keys = loadTemplate('backend');
    expect(keys).toEqual(['DB_HOST', 'DB_PORT', 'API_KEY']);
  });

  it('throws when loading a non-existent template', () => {
    expect(() => loadTemplate('ghost')).toThrow('Template "ghost" not found.');
  });
});

describe('listTemplates', () => {
  it('returns empty array when no templates exist', () => {
    expect(listTemplates()).toEqual([]);
  });

  it('returns all saved template names', () => {
    saveTemplate('alpha', ['A']);
    saveTemplate('beta', ['B']);
    expect(listTemplates().sort()).toEqual(['alpha', 'beta']);
  });
});

describe('deleteTemplate', () => {
  it('deletes an existing template', () => {
    saveTemplate('temp', ['X']);
    deleteTemplate('temp');
    expect(listTemplates()).not.toContain('temp');
  });

  it('throws when deleting a non-existent template', () => {
    expect(() => deleteTemplate('missing')).toThrow('Template "missing" not found.');
  });
});

describe('applyTemplate', () => {
  const snapshot: Snapshot = {
    name: 'test',
    createdAt: new Date().toISOString(),
    env: { DB_HOST: 'localhost', DB_PORT: '5432', SECRET: 'abc' },
  };

  it('filters snapshot env to only template keys', () => {
    const result = applyTemplate(['DB_HOST', 'DB_PORT'], snapshot);
    expect(result.env).toEqual({ DB_HOST: 'localhost', DB_PORT: '5432' });
  });

  it('ignores template keys not present in snapshot', () => {
    const result = applyTemplate(['DB_HOST', 'MISSING_KEY'], snapshot);
    expect(result.env).toEqual({ DB_HOST: 'localhost' });
  });
});
