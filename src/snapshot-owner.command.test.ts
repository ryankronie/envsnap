import { Command } from 'commander';
import { registerSnapshotOwnerCommand } from './snapshot-owner.command';
import * as ownerModule from './snapshot-owner';

function makeProgram(): Command {
  const program = new Command();
  program.exitOverride();
  registerSnapshotOwnerCommand(program);
  return program;
}

describe('snapshot-owner command', () => {
  beforeEach(() => jest.restoreAllMocks());

  it('set: calls setOwner and prints confirmation', async () => {
    const spy = jest.spyOn(ownerModule, 'setOwner').mockResolvedValue(undefined);
    const log = jest.spyOn(console, 'log').mockImplementation();
    await makeProgram().parseAsync(['node', 'test', 'owner', 'set', 'snap1', 'alice']);
    expect(spy).toHaveBeenCalledWith('snap1', 'alice');
    expect(log).toHaveBeenCalledWith("Owner of 'snap1' set to 'alice'.");
  });

  it('get: prints owner when set', async () => {
    jest.spyOn(ownerModule, 'getOwner').mockResolvedValue('bob');
    const log = jest.spyOn(console, 'log').mockImplementation();
    await makeProgram().parseAsync(['node', 'test', 'owner', 'get', 'snap2']);
    expect(log).toHaveBeenCalledWith('Owner: bob');
  });

  it('get: prints fallback when no owner', async () => {
    jest.spyOn(ownerModule, 'getOwner').mockResolvedValue(undefined);
    const log = jest.spyOn(console, 'log').mockImplementation();
    await makeProgram().parseAsync(['node', 'test', 'owner', 'get', 'snap3']);
    expect(log).toHaveBeenCalledWith("No owner set for 'snap3'.");
  });

  it('remove: calls removeOwner and prints confirmation', async () => {
    const spy = jest.spyOn(ownerModule, 'removeOwner').mockResolvedValue(undefined);
    const log = jest.spyOn(console, 'log').mockImplementation();
    await makeProgram().parseAsync(['node', 'test', 'owner', 'remove', 'snap4']);
    expect(spy).toHaveBeenCalledWith('snap4');
    expect(log).toHaveBeenCalledWith("Owner removed from 'snap4'.");
  });

  it('list: prints all owners', async () => {
    jest.spyOn(ownerModule, 'listOwners').mockResolvedValue({ snap1: 'alice', snap2: 'bob' });
    const log = jest.spyOn(console, 'log').mockImplementation();
    await makeProgram().parseAsync(['node', 'test', 'owner', 'list']);
    expect(log).toHaveBeenCalledWith('  snap1: alice');
    expect(log).toHaveBeenCalledWith('  snap2: bob');
  });

  it('list: prints fallback when empty', async () => {
    jest.spyOn(ownerModule, 'listOwners').mockResolvedValue({});
    const log = jest.spyOn(console, 'log').mockImplementation();
    await makeProgram().parseAsync(['node', 'test', 'owner', 'list']);
    expect(log).toHaveBeenCalledWith('No owners assigned.');
  });
});
