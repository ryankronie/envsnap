import * as fs from 'fs';
import * as path from 'path';
import { ensureSnapshotsDir } from './snapshot';

const PINS_FILE = '.envsnap/pins.json';

export interface PinsData {
  pinned: string[];
}

export function loadPins(): PinsData {
  ensureSnapshotsDir();
  if (!fs.existsSync(PINS_FILE)) {
    return { pinned: [] };
  }
  const raw = fs.readFileSync(PINS_FILE, 'utf-8');
  return JSON.parse(raw) as PinsData;
}

export function savePins(data: PinsData): void {
  ensureSnapshotsDir();
  fs.writeFileSync(PINS_FILE, JSON.stringify(data, null, 2));
}

export function pinSnapshot(name: string): void {
  const data = loadPins();
  if (data.pinned.includes(name)) {
    throw new Error(`Snapshot "${name}" is already pinned.`);
  }
  data.pinned.push(name);
  savePins(data);
}

export function unpinSnapshot(name: string): void {
  const data = loadPins();
  const idx = data.pinned.indexOf(name);
  if (idx === -1) {
    throw new Error(`Snapshot "${name}" is not pinned.`);
  }
  data.pinned.splice(idx, 1);
  savePins(data);
}

export function isPinned(name: string): boolean {
  return loadPins().pinned.includes(name);
}

export function listPinned(): string[] {
  return loadPins().pinned;
}
