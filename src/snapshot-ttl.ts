import * as fs from 'fs';
import * as path from 'path';

export const ttlFilePath = (dir: string) => path.join(dir, '.ttls.json');

export interface TtlEntry {
  expiresAt: number;
}

export type TtlMap = Record<string, TtlEntry>;

export async function loadTtls(dir: string): Promise<TtlMap> {
  const file = ttlFilePath(dir);
  if (!fs.existsSync(file)) return {};
  const raw = await fs.promises.readFile(file, 'utf-8');
  return JSON.parse(raw) as TtlMap;
}

export async function saveTtls(ttls: TtlMap, dir: string): Promise<void> {
  const file = ttlFilePath(dir);
  await fs.promises.writeFile(file, JSON.stringify(ttls, null, 2), 'utf-8');
}

export function parseTtlString(ttl: string): number {
  const match = ttl.match(/^(\d+)(d|h|m|s)$/);
  if (!match) throw new Error(`Invalid TTL format: "${ttl}". Use e.g. 1d, 2h, 30m, 60s.`);
  const value = parseInt(match[1], 10);
  const unit = match[2];
  const multipliers: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };
  return value * multipliers[unit];
}

export async function setTtl(name: string, ttlStr: string, dir: string): Promise<TtlEntry> {
  const ms = parseTtlString(ttlStr);
  const entry: TtlEntry = { expiresAt: Date.now() + ms };
  const ttls = await loadTtls(dir);
  ttls[name] = entry;
  await saveTtls(ttls, dir);
  return entry;
}

export async function removeTtl(name: string, dir: string): Promise<void> {
  const ttls = await loadTtls(dir);
  delete ttls[name];
  await saveTtls(ttls, dir);
}

export async function getTtl(name: string, dir: string): Promise<TtlEntry | null> {
  const ttls = await loadTtls(dir);
  return ttls[name] ?? null;
}

export async function isExpired(name: string, dir: string): Promise<boolean> {
  const entry = await getTtl(name, dir);
  if (!entry) return false;
  return Date.now() > entry.expiresAt;
}

export async function getExpiredSnapshots(dir: string): Promise<string[]> {
  const ttls = await loadTtls(dir);
  const now = Date.now();
  return Object.entries(ttls)
    .filter(([, entry]) => now > entry.expiresAt)
    .map(([name]) => name);
}
