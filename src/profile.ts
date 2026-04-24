import * as fs from 'fs';
import * as path from 'path';
import { ensureSnapshotsDir } from './snapshot';

const PROFILES_FILE = path.join(process.env.HOME || '.', '.envsnap', 'profiles.json');

export interface Profile {
  name: string;
  snapshots: string[];
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export type ProfileMap = Record<string, Profile>;

export function loadProfiles(): ProfileMap {
  ensureSnapshotsDir();
  if (!fs.existsSync(PROFILES_FILE)) return {};
  try {
    return JSON.parse(fs.readFileSync(PROFILES_FILE, 'utf-8'));
  } catch {
    return {};
  }
}

export function saveProfiles(profiles: ProfileMap): void {
  ensureSnapshotsDir();
  fs.writeFileSync(PROFILES_FILE, JSON.stringify(profiles, null, 2), 'utf-8');
}

export function createProfile(name: string, description?: string): Profile {
  const profiles = loadProfiles();
  if (profiles[name]) throw new Error(`Profile "${name}" already exists.`);
  const now = new Date().toISOString();
  const profile: Profile = { name, snapshots: [], description, createdAt: now, updatedAt: now };
  profiles[name] = profile;
  saveProfiles(profiles);
  return profile;
}

export function addSnapshotToProfile(profileName: string, snapshotName: string): void {
  const profiles = loadProfiles();
  if (!profiles[profileName]) throw new Error(`Profile "${profileName}" not found.`);
  if (!profiles[profileName].snapshots.includes(snapshotName)) {
    profiles[profileName].snapshots.push(snapshotName);
    profiles[profileName].updatedAt = new Date().toISOString();
    saveProfiles(profiles);
  }
}

export function removeSnapshotFromProfile(profileName: string, snapshotName: string): void {
  const profiles = loadProfiles();
  if (!profiles[profileName]) throw new Error(`Profile "${profileName}" not found.`);
  profiles[profileName].snapshots = profiles[profileName].snapshots.filter(s => s !== snapshotName);
  profiles[profileName].updatedAt = new Date().toISOString();
  saveProfiles(profiles);
}

export function deleteProfile(name: string): void {
  const profiles = loadProfiles();
  if (!profiles[name]) throw new Error(`Profile "${name}" not found.`);
  delete profiles[name];
  saveProfiles(profiles);
}

export function listProfiles(): Profile[] {
  return Object.values(loadProfiles());
}
