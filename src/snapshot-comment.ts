import * as fs from 'fs';
import * as path from 'path';
import { ensureSnapshotsDir } from './snapshot';

export const commentFilePath = () =>
  path.join(ensureSnapshotsDir(), '.comments.json');

export interface CommentEntry {
  text: string;
  createdAt: string;
  updatedAt: string;
}

export type CommentsMap = Record<string, CommentEntry>;

export function loadComments(): CommentsMap {
  const file = commentFilePath();
  if (!fs.existsSync(file)) return {};
  try {
    return JSON.parse(fs.readFileSync(file, 'utf-8'));
  } catch {
    return {};
  }
}

export function saveComments(comments: CommentsMap): void {
  fs.writeFileSync(commentFilePath(), JSON.stringify(comments, null, 2));
}

export function setComment(snapshotName: string, text: string): CommentEntry {
  const comments = loadComments();
  const now = new Date().toISOString();
  const existing = comments[snapshotName];
  const entry: CommentEntry = {
    text,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
  comments[snapshotName] = entry;
  saveComments(comments);
  return entry;
}

export function removeComment(snapshotName: string): boolean {
  const comments = loadComments();
  if (!comments[snapshotName]) return false;
  delete comments[snapshotName];
  saveComments(comments);
  return true;
}

export function getComment(snapshotName: string): CommentEntry | undefined {
  return loadComments()[snapshotName];
}

export function listComments(): Array<{ name: string } & CommentEntry> {
  const comments = loadComments();
  return Object.entries(comments).map(([name, entry]) => ({ name, ...entry }));
}
