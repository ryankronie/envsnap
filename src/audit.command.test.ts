import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { registerAuditCommand } from './audit.command';
import { recordAudit, clearAuditLog } from './audit';

const auditFile = path.join(os.homedir(), '.envsnap', 'audit.json');

function makeProgram() {
  const program = new Command();
  program.exitOverride();
  registerAuditCommand(program);
  return program;
}

function cleanup() {
  if (fs.existsSync(auditFile)) fs.unlinkSync(auditFile);
}

describe('audit command', () => {
  beforeEach(cleanup);
  afterAll(cleanup);

  it('list shows no entries message when empty', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    makeProgram().parse(['audit', 'list'], { from: 'user' });
    expect(spy).toHaveBeenCalledWith('No audit entries found.');
    spy.mockRestore();
  });

  it('list shows entries', () => {
    recordAudit('save', 'mysnap');
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    makeProgram().parse(['audit', 'list'], { from: 'user' });
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('SAVE'));
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('mysnap'));
    spy.mockRestore();
  });

  it('list --snapshot filters entries', () => {
    recordAudit('save', 'snap1');
    recordAudit('load', 'snap2');
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    makeProgram().parse(['audit', 'list', '--snapshot', 'snap1'], { from: 'user' });
    const calls = spy.mock.calls.map((c) => c[0]);
    expect(calls.some((c) => c.includes('snap1'))).toBe(true);
    expect(calls.some((c) => c.includes('snap2'))).toBe(false);
    spy.mockRestore();
  });

  it('clear empties the log', () => {
    recordAudit('save', 'snap1');
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    makeProgram().parse(['audit', 'clear'], { from: 'user' });
    expect(spy).toHaveBeenCalledWith('Audit log cleared.');
    spy.mockRestore();
    const { loadAuditLog } = require('./audit');
    expect(loadAuditLog()).toEqual([]);
  });
});
