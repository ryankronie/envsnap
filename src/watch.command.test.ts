import { Command } from 'commander';
import { registerWatchCommand } from './watch.command';
import * as watchModule from './watch';

function makeProgram() {
  const program = new Command();
  program.exitOverride();
  registerWatchCommand(program);
  return program;
}

test('watch command registers correctly', () => {
  const program = makeProgram();
  const cmd = program.commands.find(c => c.name() === 'watch');
  expect(cmd).toBeDefined();
});

test('watch command invokes watchEnvFile with correct options', () => {
  const mockHandle = { stop: jest.fn(), isRunning: jest.fn(() => false) };
  const spy = jest.spyOn(watchModule, 'watchEnvFile').mockReturnValue(mockHandle);

  // Prevent process.on SIGINT from interfering
  const onSpy = jest.spyOn(process, 'on').mockImplementation(() => process);

  const program = makeProgram();
  program.parse(['node', 'cli', 'watch', 'mysnap', '--file', '.env.test', '--interval', '500']);

  expect(spy).toHaveBeenCalledWith(expect.objectContaining({
    snapshotName: 'mysnap',
    envFile: '.env.test',
    interval: 500,
  }));

  spy.mockRestore();
  onSpy.mockRestore();
});

test('watch command exits on invalid interval', () => {
  const program = makeProgram();
  const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
  expect(() => {
    program.parse(['node', 'cli', 'watch', 'mysnap', '--interval', '50']);
  }).toThrow('exit');
  exitSpy.mockRestore();
});

test('watch command uses default file and interval', () => {
  const mockHandle = { stop: jest.fn(), isRunning: jest.fn(() => false) };
  const spy = jest.spyOn(watchModule, 'watchEnvFile').mockReturnValue(mockHandle);
  const onSpy = jest.spyOn(process, 'on').mockImplementation(() => process);

  const program = makeProgram();
  program.parse(['node', 'cli', 'watch', 'defaults']);

  expect(spy).toHaveBeenCalledWith(expect.objectContaining({
    snapshotName: 'defaults',
    envFile: '.env',
    interval: 2000,
  }));

  spy.mockRestore();
  onSpy.mockRestore();
});
