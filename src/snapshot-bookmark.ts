import * as fs from 'fs';
import * as path from 'path';
import { ensureSnapshotsDir } from './snapshot';

export interface Bookmark {
  name: string;
  snapshotId: string;
  createdAt: string;
  description?: string;
}

export interface BookmarkStore {
  bookmarks: Bookmark[];
}

export function bookmarkFilePath(): string {
  return path.join(ensureSnapshotsDir(), '.bookmarks.json');
}

export function loadBookmarks(): BookmarkStore {
  const filePath = bookmarkFilePath();
  if (!fs.existsSync(filePath)) {
    return { bookmarks: [] };
  }
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw) as BookmarkStore;
}

export function saveBookmarks(store: BookmarkStore): void {
  const filePath = bookmarkFilePath();
  fs.writeFileSync(filePath, JSON.stringify(store, null, 2), 'utf-8');
}

export function addBookmark(name: string, snapshotId: string, description?: string): Bookmark {
  const store = loadBookmarks();
  if (store.bookmarks.find((b) => b.name === name)) {
    throw new Error(`Bookmark "${name}" already exists.`);
  }
  const bookmark: Bookmark = {
    name,
    snapshotId,
    createdAt: new Date().toISOString(),
    description,
  };
  store.bookmarks.push(bookmark);
  saveBookmarks(store);
  return bookmark;
}

export function removeBookmark(name: string): void {
  const store = loadBookmarks();
  const index = store.bookmarks.findIndex((b) => b.name === name);
  if (index === -1) {
    throw new Error(`Bookmark "${name}" not found.`);
  }
  store.bookmarks.splice(index, 1);
  saveBookmarks(store);
}

export function getBookmark(name: string): Bookmark | undefined {
  const store = loadBookmarks();
  return store.bookmarks.find((b) => b.name === name);
}

export function listBookmarks(): Bookmark[] {
  return loadBookmarks().bookmarks;
}

export function resolveBookmark(nameOrId: string): string {
  const bookmark = getBookmark(nameOrId);
  return bookmark ? bookmark.snapshotId : nameOrId;
}
