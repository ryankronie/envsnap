export interface Snapshot {
  name: string;
  createdAt: number;
  env: Record<string, string>;
}

export interface DiffEntry {
  key: string;
  status: 'added' | 'removed' | 'changed';
  oldValue?: string;
  newValue?: string;
}

export interface HistoryEntry {
  timestamp: number;
  action: string;
  snapshotName: string;
}

export interface TagMap {
  [snapshotName: string]: string[];
}
