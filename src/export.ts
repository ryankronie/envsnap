import { loadSnapshot } from './snapshot';
import { Env } from './types';
import * as fs from 'fs';
import * as path from 'path';

export type ExportFormat = 'dotenv' | 'json' | 'shell';

export function formatAsDotenv(env: Env): string {
  return Object.entries(env)
    .map(([k, v]) => `${k}=${v}`)
    .join('\n') + '\n';
}

export function formatAsShell(env: Env): string {
  return Object.entries(env)
    .map(([k, v]) => `export ${k}="${v.replace(/"/g, '\\"')}"`)
    .join('\n') + '\n';
}

export function formatAsJson(env: Env): string {
  return JSON.stringify(env, null, 2) + '\n';
}

export function renderExport(env: Env, format: ExportFormat): string {
  switch (format) {
    case 'dotenv': return formatAsDotenv(env);
    case 'shell': return formatAsShell(env);
    case 'json': return formatAsJson(env);
    default: throw new Error(`Unknown format: ${format}`);
  }
}

export async function exportSnapshot(
  name: string,
  format: ExportFormat = 'dotenv',
  outputPath?: string
): Promise<string> {
  const env = await loadSnapshot(name);
  const content = renderExport(env, format);
  if (outputPath) {
    fs.writeFileSync(path.resolve(outputPath), content, 'utf-8');
  }
  return content;
}
