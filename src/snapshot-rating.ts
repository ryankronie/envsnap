import * as fs from 'fs';
import * as path from 'path';
import { ensureSnapshotsDir } from './snapshot';

export interface SnapshotRating {
  score: number; // 1-5
  note?: string;
  ratedAt: string;
}

export interface RatingsMap {
  [snapshotName: string]: SnapshotRating;
}

export function ratingFilePath(): string {
  const dir = ensureSnapshotsDir();
  return path.join(dir, '.ratings.json');
}

export function loadRatings(): RatingsMap {
  const filePath = ratingFilePath();
  if (!fs.existsSync(filePath)) return {};
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as RatingsMap;
  } catch {
    return {};
  }
}

export function saveRatings(ratings: RatingsMap): void {
  fs.writeFileSync(ratingFilePath(), JSON.stringify(ratings, null, 2));
}

export function setRating(
  snapshotName: string,
  score: number,
  note?: string
): SnapshotRating {
  if (score < 1 || score > 5) {
    throw new Error('Rating score must be between 1 and 5');
  }
  const ratings = loadRatings();
  const entry: SnapshotRating = {
    score,
    note,
    ratedAt: new Date().toISOString(),
  };
  ratings[snapshotName] = entry;
  saveRatings(ratings);
  return entry;
}

export function removeRating(snapshotName: string): boolean {
  const ratings = loadRatings();
  if (!ratings[snapshotName]) return false;
  delete ratings[snapshotName];
  saveRatings(ratings);
  return true;
}

export function getRating(snapshotName: string): SnapshotRating | null {
  const ratings = loadRatings();
  return ratings[snapshotName] ?? null;
}

export function listRatings(): Array<{ name: string } & SnapshotRating> {
  const ratings = loadRatings();
  return Object.entries(ratings)
    .map(([name, rating]) => ({ name, ...rating }))
    .sort((a, b) => b.score - a.score);
}
