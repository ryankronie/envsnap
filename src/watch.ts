import fs from 'fs';
import path from 'path';
import { saveSnapshot } from './snapshot';
import { recordAction } from './history';
import { recordAudit } from './audit';

export interface WatchOptions {
  snapshotName: string;
  envFile: string;
  interval?: number;
  onChange?: (name: string) => void;
}

export interface WatchHandle {
  stop: () => void;
  isRunning: () => boolean;
}

export function watchEnvFile(options: WatchOptions): WatchHandle {
  const { snapshotName, envFile, interval = 2000, onChange } = options;
  let running = true;
  let lastMtime = 0;

  const resolvedPath = path.resolve(envFile);

  const check = async () => {
    if (!running) return;
    try {
      const stat = fs.statSync(resolvedPath);
      const mtime = stat.mtimeMs;
      if (mtime !== lastMtime && lastMtime !== 0) {
        const raw = fs.readFileSync(resolvedPath, 'utf-8');
        const vars: Record<string, string> = {};
        for (const line of raw.split('\n')) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith('#')) continue;
          const eq = trimmed.indexOf('=');
          if (eq === -1) continue;
          vars[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
        }
        const versionedName = `${snapshotName}-${Date.now()}`;
        saveSnapshot(versionedName, vars);
        recordAction(versionedName, 'watch-save');
        recordAudit(versionedName, 'watch-save', { source: resolvedPath });
        onChange?.(versionedName);
      }
      lastMtime = mtime;
    } catch {
      // file may not exist yet
    }
    if (running) setTimeout(check, interval);
  };

  setTimeout(check, interval);

  return {
    stop: () => { running = false; },
    isRunning: () => running,
  };
}
