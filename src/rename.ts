import * as fs from 'fs';
import * as path from 'path';
import { loadSnapshot, saveSnapshot, deleteSnapshot, listSnapshots } from './snapshot';
import { recordAction } from './history';

export function renameSnapshot(
  oldName: string,
  newName: string,
  snapshotsDir: string = '.envsnap'
): void {
  const existing = listSnapshots(snapshotsDir);

  if (!existing.includes(oldName)) {
    throw new Error(`Snapshot "${oldName}" does not exist.`);
  }

  if (existing.includes(newName)) {
    throw new Error(`Snapshot "${newName}" already exists. Choose a different name.`);
  }

  const data = loadSnapshot(oldName, snapshotsDir);
  saveSnapshot(newName, data, snapshotsDir);
  deleteSnapshot(oldName, snapshotsDir);

  recordAction({ action: 'rename', snapshot: newName, meta: { from: oldName } });
}

export function copySnapshot(
  sourceName: string,
  destName: string,
  snapshotsDir: string = '.envsnap'
): void {
  const existing = listSnapshots(snapshotsDir);

  if (!existing.includes(sourceName)) {
    throw new Error(`Snapshot "${sourceName}" does not exist.`);
  }

  if (existing.includes(destName)) {
    throw new Error(`Snapshot "${destName}" already exists. Choose a different name.`);
  }

  const data = loadSnapshot(sourceName, snapshotsDir);
  saveSnapshot(destName, data, snapshotsDir);

  recordAction({ action: 'copy', snapshot: destName, meta: { from: sourceName } });
}
