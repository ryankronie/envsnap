import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import {
  ensureAuditFile,
  loadAuditLog,
  recordAudit,
  getAuditForSnapshot,
  clearAuditLog,
} from './audit';

const auditFile = path.join(os.homedir(), '.envsnap', 'audit.json');

function cleanup() {
  if (fs.existsSync(auditFile)) fs.unlinkSync(auditFile);
}

describe('audit', () => {
  beforeEach(cleanup);
  afterAll(cleanup);

  it('ensureAuditFile creates file if missing', () => {
    ensureAuditFile();
    expect(fs.existsSync(auditFile)).toBe(true);
  });

  it('loadAuditLog returns empty array initially', () => {
    expect(loadAuditLog()).toEqual([]);
  });

  it('recordAudit appends an entry', () => {
    recordAudit('save', 'mysnap', 'initial save');
    const entries = loadAuditLog();
    expect(entries).toHaveLength(1);
    expect(entries[0].action).toBe('save');
    expect(entries[0].snapshotName).toBe('mysnap');
    expect(entries[0].details).toBe('initial save');
    expect(entries[0].user).toBeTruthy();
  });

  it('recordAudit stores multiple entries', () => {
    recordAudit('save', 'snap1');
    recordAudit('load', 'snap2');
    expect(loadAuditLog()).toHaveLength(2);
  });

  it('getAuditForSnapshot filters by name', () => {
    recordAudit('save', 'snap1');
    recordAudit('load', 'snap2');
    recordAudit('delete', 'snap1');
    const result = getAuditForSnapshot('snap1');
    expect(result).toHaveLength(2);
    expect(result.every((e) => e.snapshotName === 'snap1')).toBe(true);
  });

  it('clearAuditLog empties the log', () => {
    recordAudit('save', 'snap1');
    clearAuditLog();
    expect(loadAuditLog()).toEqual([]);
  });
});
