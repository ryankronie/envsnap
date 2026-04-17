import * as fs from 'fs';
import * as path from 'path';

export interface ScheduleEntry {
  snapshot: string;
  cron: string;
  action: 'save' | 'restore';
  createdAt: string;
}

function scheduleFile(dir: string) {
  return path.join(dir, 'schedule.json');
}

export function loadSchedule(dir: string): ScheduleEntry[] {
  const file = scheduleFile(dir);
  if (!fs.existsSync(file)) return [];
  return JSON.parse(fs.readFileSync(file, 'utf-8'));
}

export function saveSchedule(dir: string, entries: ScheduleEntry[]): void {
  fs.writeFileSync(scheduleFile(dir), JSON.stringify(entries, null, 2));
}

export function addSchedule(
  dir: string,
  snapshot: string,
  cron: string,
  action: 'save' | 'restore'
): ScheduleEntry {
  const entries = loadSchedule(dir);
  const existing = entries.find(e => e.snapshot === snapshot && e.action === action);
  if (existing) {
    existing.cron = cron;
    saveSchedule(dir, entries);
    return existing;
  }
  const entry: ScheduleEntry = { snapshot, cron, action, createdAt: new Date().toISOString() };
  entries.push(entry);
  saveSchedule(dir, entries);
  return entry;
}

export function removeSchedule(dir: string, snapshot: string, action: 'save' | 'restore'): boolean {
  const entries = loadSchedule(dir);
  const next = entries.filter(e => !(e.snapshot === snapshot && e.action === action));
  if (next.length === entries.length) return false;
  saveSchedule(dir, next);
  return true;
}

export function getSchedulesForSnapshot(dir: string, snapshot: string): ScheduleEntry[] {
  return loadSchedule(dir).filter(e => e.snapshot === snapshot);
}
