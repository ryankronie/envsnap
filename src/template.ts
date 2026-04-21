import * as fs from 'fs';
import * as path from 'path';
import { Snapshot } from './types';

const TEMPLATES_DIR = path.join(process.cwd(), '.envsnap', 'templates');

export function ensureTemplatesDir(): void {
  if (!fs.existsSync(TEMPLATES_DIR)) {
    fs.mkdirSync(TEMPLATES_DIR, { recursive: true });
  }
}

export function saveTemplate(name: string, keys: string[]): void {
  ensureTemplatesDir();
  const filePath = path.join(TEMPLATES_DIR, `${name}.json`);
  fs.writeFileSync(filePath, JSON.stringify({ name, keys }, null, 2), 'utf-8');
}

export function loadTemplate(name: string): string[] {
  const filePath = path.join(TEMPLATES_DIR, `${name}.json`);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Template "${name}" not found.`);
  }
  const raw = fs.readFileSync(filePath, 'utf-8');
  const parsed = JSON.parse(raw);
  return parsed.keys as string[];
}

export function listTemplates(): string[] {
  ensureTemplatesDir();
  return fs
    .readdirSync(TEMPLATES_DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.replace(/\.json$/, ''));
}

export function deleteTemplate(name: string): void {
  const filePath = path.join(TEMPLATES_DIR, `${name}.json`);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Template "${name}" not found.`);
  }
  fs.unlinkSync(filePath);
}

export function applyTemplate(template: string[], snapshot: Snapshot): Snapshot {
  const filtered: Record<string, string> = {};
  for (const key of template) {
    if (key in snapshot.env) {
      filtered[key] = snapshot.env[key];
    }
  }
  return { ...snapshot, env: filtered };
}
