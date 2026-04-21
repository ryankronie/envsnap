import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export interface AuditEntry {
  timestamp: string;
  action: 'save' | 'load' | 'delete' | 'restore' | 'encrypt' | 'decrypt' | 'import' | 'export';
  snapshotName: string;
  user: string;
  details?: string;
}

const auditFile = path.join(os.homedir(), '.envsnap', 'audit.json');

export function ensureAuditFile(): void {
  const dir = path.dirname(auditFile);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(auditFile)) fs.writeFileSync(auditFile, JSON.stringify([]));
}

export function loadAuditLog(): AuditEntry[] {
  ensureAuditFile();
  try {
    return JSON.parse(fs.readFileSync(auditFile, 'utf-8'));
  } catch {
    return [];
  }
}

export function saveAuditLog(entries: AuditEntry[]): void {
  ensureAuditFile();
  fs.writeFileSync(auditFile, JSON.stringify(entries, null, 2));
}

export function recordAudit(
  action: AuditEntry['action'],
  snapshotName: string,
  details?: string
): void {
  const entries = loadAuditLog();
  entries.push({
    timestamp: new Date().toISOString(),
    action,
    snapshotName,
    user: os.userInfo().username,
    details,
  });
  saveAuditLog(entries);
}

export function getAuditForSnapshot(snapshotName: string): AuditEntry[] {
  return loadAuditLog().filter((e) => e.snapshotName === snapshotName);
}

export function clearAuditLog(): void {
  saveAuditLog([]);
}
