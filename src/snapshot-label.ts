import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export const labelFilePath = path.join(os.homedir(), '.envsnap', 'labels.json');

export type LabelMap = Record<string, string[]>;

export function loadLabels(): LabelMap {
  if (!fs.existsSync(labelFilePath)) return {};
  try {
    return JSON.parse(fs.readFileSync(labelFilePath, 'utf-8'));
  } catch {
    return {};
  }
}

export function saveLabels(labels: LabelMap): void {
  const dir = path.dirname(labelFilePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(labelFilePath, JSON.stringify(labels, null, 2));
}

export function addLabel(snapshotName: string, label: string): void {
  const labels = loadLabels();
  if (!labels[snapshotName]) labels[snapshotName] = [];
  if (!labels[snapshotName].includes(label)) {
    labels[snapshotName].push(label);
    saveLabels(labels);
  }
}

export function removeLabel(snapshotName: string, label: string): void {
  const labels = loadLabels();
  if (!labels[snapshotName]) return;
  labels[snapshotName] = labels[snapshotName].filter((l) => l !== label);
  if (labels[snapshotName].length === 0) delete labels[snapshotName];
  saveLabels(labels);
}

export function getLabels(snapshotName: string): string[] {
  return loadLabels()[snapshotName] ?? [];
}

export function getSnapshotsByLabel(label: string): string[] {
  const labels = loadLabels();
  return Object.entries(labels)
    .filter(([, lbls]) => lbls.includes(label))
    .map(([name]) => name);
}

export function clearLabels(snapshotName: string): void {
  const labels = loadLabels();
  delete labels[snapshotName];
  saveLabels(labels);
}
