export type Env = Record<string, string>;

export interface Snapshot {
  name: string;
  createdAt: string;
  env: Env;
}

export interface DiffEntry {
  key: string;
  type: 'added' | 'removed' | 'changed';
  oldValue?: string;
  newValue?: string;
}
