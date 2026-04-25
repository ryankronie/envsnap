import * as fs from 'fs';
import * as path from 'path';
import { ensureSnapshotsDir } from './snapshot';

const NOTES_FILE = 'notes.json';

export type NotesMap = Record<string, string>;

function notesFilePath(): string {
  const dir = ensureSnapshotsDir();
  return path.join(dir, NOTES_FILE);
}

export function loadNotes(): NotesMap {
  const filePath = notesFilePath();
  if (!fs.existsSync(filePath)) return {};
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as NotesMap;
  } catch {
    return {};
  }
}

export function saveNotes(notes: NotesMap): void {
  const filePath = notesFilePath();
  fs.writeFileSync(filePath, JSON.stringify(notes, null, 2), 'utf-8');
}

export function setNote(snapshotName: string, note: string): void {
  const notes = loadNotes();
  notes[snapshotName] = note;
  saveNotes(notes);
}

export function getNote(snapshotName: string): string | undefined {
  const notes = loadNotes();
  return notes[snapshotName];
}

export function removeNote(snapshotName: string): boolean {
  const notes = loadNotes();
  if (!(snapshotName in notes)) return false;
  delete notes[snapshotName];
  saveNotes(notes);
  return true;
}

export function listNotes(): Array<{ snapshot: string; note: string }> {
  const notes = loadNotes();
  return Object.entries(notes).map(([snapshot, note]) => ({ snapshot, note }));
}
