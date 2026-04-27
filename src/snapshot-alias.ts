import fs from 'fs/promises';
import path from 'path';
import { ensureSnapshotsDir } from './snapshot';

export type AliasMap = Record<string, string>;

export function aliasFilePath(): string {
  return path.join(process.env.ENVSNAP_DIR ?? '.envsnap', 'aliases.json');
}

export async function loadAliases(): Promise<AliasMap> {
  await ensureSnapshotsDir();
  try {
    const raw = await fs.readFile(aliasFilePath(), 'utf-8');
    return JSON.parse(raw) as AliasMap;
  } catch {
    return {};
  }
}

export async function saveAliases(aliases: AliasMap): Promise<void> {
  await ensureSnapshotsDir();
  await fs.writeFile(aliasFilePath(), JSON.stringify(aliases, null, 2), 'utf-8');
}

export async function setAlias(name: string, target: string): Promise<void> {
  const aliases = await loadAliases();
  aliases[name] = target;
  await saveAliases(aliases);
}

export async function removeAlias(name: string): Promise<void> {
  const aliases = await loadAliases();
  delete aliases[name];
  await saveAliases(aliases);
}

export async function resolveAlias(name: string): Promise<string | null> {
  const aliases = await loadAliases();
  return aliases[name] ?? null;
}

export async function listAliases(): Promise<AliasMap> {
  return loadAliases();
}

export async function resolveOrPassthrough(nameOrAlias: string): Promise<string> {
  const resolved = await resolveAlias(nameOrAlias);
  return resolved ?? nameOrAlias;
}
