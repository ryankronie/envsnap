import * as fs from 'fs';
import * as path from 'path';
import { EnvMap } from './types';

export function parseDotenv(content: string): EnvMap {
  const result: EnvMap = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    let value = trimmed.slice(eqIndex + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (key) result[key] = value;
  }
  return result;
}

export function parseShellExport(content: string): EnvMap {
  const result: EnvMap = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('export ')) continue;
    const rest = trimmed.slice('export '.length);
    const eqIndex = rest.indexOf('=');
    if (eqIndex === -1) continue;
    const key = rest.slice(0, eqIndex).trim();
    let value = rest.slice(eqIndex + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (key) result[key] = value;
  }
  return result;
}

export function parseJson(content: string): EnvMap {
  const parsed = JSON.parse(content);
  const result: EnvMap = {};
  for (const [k, v] of Object.entries(parsed)) {
    if (typeof v === 'string') result[k] = v;
  }
  return result;
}

export type ImportFormat = 'dotenv' | 'shell' | 'json';

export function importFromFile(filePath: string, format?: ImportFormat): EnvMap {
  const content = fs.readFileSync(filePath, 'utf-8');
  const ext = path.extname(filePath).toLowerCase();
  const fmt = format ?? (ext === '.json' ? 'json' : ext === '.sh' ? 'shell' : 'dotenv');
  switch (fmt) {
    case 'json': return parseJson(content);
    case 'shell': return parseShellExport(content);
    default: return parseDotenv(content);
  }
}
