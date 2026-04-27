import { Command } from 'commander';
import { registerSnapshotAliasCommand } from './snapshot-alias.command';
import * as alias from './snapshot-alias';

function makeProgram() {
  const program = new Command();
  program.exitOverride();
  registerSnapshotAliasCommand(program);
  return program;
}

beforeEach(() => {
  jest.resetAllMocks();
});

describe('alias set', () => {
  it('calls setAlias with name and target', async () => {
    const spy = jest.spyOn(alias, 'setAlias').mockResolvedValue(undefined);
    const program = makeProgram();
    await program.parseAsync(['node', 'test', 'alias', 'set', 'prod', 'snapshot-2024']);
    expect(spy).toHaveBeenCalledWith('prod', 'snapshot-2024');
  });
});

describe('alias remove', () => {
  it('calls removeAlias with name', async () => {
    const spy = jest.spyOn(alias, 'removeAlias').mockResolvedValue(undefined);
    const program = makeProgram();
    await program.parseAsync(['node', 'test', 'alias', 'remove', 'prod']);
    expect(spy).toHaveBeenCalledWith('prod');
  });
});

describe('alias list', () => {
  it('prints all aliases', async () => {
    jest.spyOn(alias, 'listAliases').mockResolvedValue({ prod: 'snapshot-2024', dev: 'snapshot-dev' });
    const log = jest.spyOn(console, 'log').mockImplementation(() => {});
    const program = makeProgram();
    await program.parseAsync(['node', 'test', 'alias', 'list']);
    expect(log).toHaveBeenCalledWith('prod -> snapshot-2024');
    expect(log).toHaveBeenCalledWith('dev -> snapshot-dev');
  });

  it('prints message when no aliases exist', async () => {
    jest.spyOn(alias, 'listAliases').mockResolvedValue({});
    const log = jest.spyOn(console, 'log').mockImplementation(() => {});
    const program = makeProgram();
    await program.parseAsync(['node', 'test', 'alias', 'list']);
    expect(log).toHaveBeenCalledWith('No aliases defined.');
  });
});

describe('alias resolve', () => {
  it('prints resolved snapshot name', async () => {
    jest.spyOn(alias, 'resolveAlias').mockResolvedValue('snapshot-2024');
    const log = jest.spyOn(console, 'log').mockImplementation(() => {});
    const program = makeProgram();
    await program.parseAsync(['node', 'test', 'alias', 'resolve', 'prod']);
    expect(log).toHaveBeenCalledWith('snapshot-2024');
  });

  it('prints error when alias not found', async () => {
    jest.spyOn(alias, 'resolveAlias').mockResolvedValue(null);
    const err = jest.spyOn(console, 'error').mockImplementation(() => {});
    const program = makeProgram();
    await program.parseAsync(['node', 'test', 'alias', 'resolve', 'missing']);
    expect(err).toHaveBeenCalledWith('Alias "missing" not found.');
  });
});
