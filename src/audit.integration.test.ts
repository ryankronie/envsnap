import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { recordAudit, loadAuditLog, getAuditForSnapshot, clearAuditLog } from './audit';

const auditFile = path.join(os.homedir(), '.envsnap', 'audit.json');

function cleanup() {
  if (fs.existsSync(auditFile)) fs.unlinkSync(auditFile);
}

describe('audit integration', () => {
  beforeEach(cleanup);
  afterAll(cleanup);

  it('records a full workflow and retrieves it', () => {
    recordAudit('save', 'prod', 'initial snapshot');
    recordAudit('encrypt', 'prod', 'encrypted with passphrase');
    recordAudit('export', 'prod', 'exported as dotenv');
    recordAudit('restore', 'prod');

    const all = loadAuditLog();
    expect(all).toHaveLength(4);

    const prodEntries = getAuditForSnapshot('prod');
    expect(prodEntries).toHaveLength(4);

    const actions = prodEntries.map((e) => e.action);
    expect(actions).toEqual(['save', 'encrypt', 'export', 'restore']);
  });

  it('timestamps are valid ISO strings', () => {
    recordAudit('load', 'staging');
    const [entry] = loadAuditLog();
    expect(() => new Date(entry.timestamp)).not.toThrow();
    expect(new Date(entry.timestamp).toISOString()).toBe(entry.timestamp);
  });

  it('clearAuditLog removes all entries after multiple records', () => {
    recordAudit('save', 'a');
    recordAudit('delete', 'b');
    clearAuditLog();
    expect(loadAuditLog()).toHaveLength(0);
  });
});
