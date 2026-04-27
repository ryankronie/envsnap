import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const aliasFile = path.join(os.homedir(), '.envsnap', 'aliases.json');

export interface AliasMap {
  [alias: string]: string;
}

export function loadAliases(): AliasMap {
  if (!fs.existsSync(aliasFile)) return {};
  try {
    return JSON.parse(fs.readFileSync(aliasFile, 'utf-8'));
  } catch {
    return {};
  }
}

export function saveAliases(aliases: AliasMap): void {
  const dir = path.dirname(aliasFile);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(aliasFile, JSON.stringify(aliases, null, 2));
}

export function setAlias(alias: string, snapshotName: string): void {
  const aliases = loadAliases();
  aliases[alias] = snapshotName;
  saveAliases(aliases);
}

export function removeAlias(alias: string): boolean {
  const aliases = loadAliases();
  if (!(alias in aliases)) return false;
  delete aliases[alias];
  saveAliases(aliases);
  return true;
}

export function resolveAlias(nameOrAlias: string): string {
  const aliases = loadAliases();
  return aliases[nameOrAlias] ?? nameOrAlias;
}

export function getAliasesForSnapshot(snapshotName: string): string[] {
  const aliases = loadAliases();
  return Object.entries(aliases)
    .filter(([, snap]) => snap === snapshotName)
    .map(([alias]) => alias);
}

export function listAliases(): Array<{ alias: string; snapshot: string }> {
  const aliases = loadAliases();
  return Object.entries(aliases).map(([alias, snapshot]) => ({ alias, snapshot }));
}
