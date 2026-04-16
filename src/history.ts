import * as fs from 'fs';
import * as path from 'path';
import { SnapshotMeta } from './types';

const HISTORY_FILE = '.envsnap/history.json';

export interface HistoryEntry {
  snapshotName: string;
  action: 'save' | 'restore' | 'delete';
  timestamp: string;
  keys?: string[];
}

function ensureHistoryFile(): void {
  const dir = path.dirname(HISTORY_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(HISTORY_FILE)) {
    fs.writeFileSync(HISTORY_FILE, JSON.stringify([]), 'utf-8');
  }
}

export function loadHistory(): HistoryEntry[] {
  ensureHistoryFile();
  const raw = fs.readFileSync(HISTORY_FILE, 'utf-8');
  return JSON.parse(raw) as HistoryEntry[];
}

export function recordAction(
  snapshotName: string,
  action: HistoryEntry['action'],
  keys?: string[]
): void {
  ensureHistoryFile();
  const history = loadHistory();
  const entry: HistoryEntry = {
    snapshotName,
    action,
    timestamp: new Date().toISOString(),
    ...(keys ? { keys } : {}),
  };
  history.push(entry);
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2), 'utf-8');
}

export function getHistoryForSnapshot(snapshotName: string): HistoryEntry[] {
  return loadHistory().filter((e) => e.snapshotName === snapshotName);
}

export function clearHistory(): void {
  ensureHistoryFile();
  fs.writeFileSync(HISTORY_FILE, JSON.stringify([]), 'utf-8');
}
