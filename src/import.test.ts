import { parseDotenv, parseShellExport, parseJson, importFromFile } from './import';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

describe('parseDotenv', () => {
  it('parses key=value pairs', () => {
    expect(parseDotenv('FOO=bar\nBAZ=qux')).toEqual({ FOO: 'bar', BAZ: 'qux' });
  });
  it('ignores comments and blank lines', () => {
    expect(parseDotenv('# comment\n\nFOO=bar')).toEqual({ FOO: 'bar' });
  });
  it('strips surrounding quotes', () => {
    expect(parseDotenv('FOO="hello world"')).toEqual({ FOO: 'hello world' });
    expect(parseDotenv("BAR='test'")).toEqual({ BAR: 'test' });
  });
  it('handles values with equals signs', () => {
    expect(parseDotenv('URL=http://a.com?x=1')).toEqual({ URL: 'http://a.com?x=1' });
  });
});

describe('parseShellExport', () => {
  it('parses export statements', () => {
    expect(parseShellExport('export FOO=bar\nexport BAZ=qux')).toEqual({ FOO: 'bar', BAZ: 'qux' });
  });
  it('ignores non-export lines', () => {
    expect(parseShellExport('FOO=bar\nexport VALID=yes')).toEqual({ VALID: 'yes' });
  });
  it('strips quotes', () => {
    expect(parseShellExport('export KEY="value"')).toEqual({ KEY: 'value' });
  });
});

describe('parseJson', () => {
  it('parses a flat string object', () => {
    expect(parseJson('{"A":"1","B":"2"}')).toEqual({ A: '1', B: '2' });
  });
  it('ignores non-string values', () => {
    expect(parseJson('{"A":"ok","B":42}')).toEqual({ A: 'ok' });
  });
});

describe('importFromFile', () => {
  const tmp = os.tmpdir();

  it('imports a .env file', () => {
    const file = path.join(tmp, 'test.env');
    fs.writeFileSync(file, 'X=1\nY=2');
    expect(importFromFile(file)).toEqual({ X: '1', Y: '2' });
    fs.unlinkSync(file);
  });

  it('imports a .json file', () => {
    const file = path.join(tmp, 'test.json');
    fs.writeFileSync(file, '{"K":"v"}');
    expect(importFromFile(file)).toEqual({ K: 'v' });
    fs.unlinkSync(file);
  });

  it('imports with explicit format override', () => {
    const file = path.join(tmp, 'envfile');
    fs.writeFileSync(file, 'export Z=99');
    expect(importFromFile(file, 'shell')).toEqual({ Z: '99' });
    fs.unlinkSync(file);
  });
});
