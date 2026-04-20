import * as fs from 'fs';
import * as path from 'path';
import { loadSnapshot } from './snapshot';
import { EnvMap } from './types';

export interface RestoreOptions {
  targetFile?: string;
  overwrite?: boolean;
  keys?: string[];
}

export function restoreToFile(
  envMap: EnvMap,
  targetFile: string,
  overwrite: boolean = false
): void {
  if (fs.existsSync(targetFile) && !overwrite) {
    throw new Error(
      `File "${targetFile}" already exists. Use --overwrite to replace it.`
    );
  }

  const lines = Object.entries(envMap)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  fs.writeFileSync(targetFile, lines + '\n', 'utf-8');
}

export function restoreToProcess(envMap: EnvMap, keys?: string[]): void {
  const entries = keys
    ? Object.entries(envMap).filter(([k]) => keys.includes(k))
    : Object.entries(envMap);

  for (const [key, value] of entries) {
    process.env[key] = value;
  }
}

export function restoreSnapshot(
  name: string,
  options: RestoreOptions = {}
): EnvMap {
  const snapshot = loadSnapshot(name);

  const envMap: EnvMap =
    options.keys && options.keys.length > 0
      ? Object.fromEntries(
          Object.entries(snapshot).filter(([k]) => options.keys!.includes(k))
        )
      : snapshot;

  if (options.targetFile) {
    restoreToFile(envMap, options.targetFile, options.overwrite ?? false);
  } else {
    restoreToProcess(envMap, options.keys);
  }

  return envMap;
}
