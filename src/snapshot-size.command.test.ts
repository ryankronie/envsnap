import { Command } from "commander";
import { registerSnapshotSizeCommand } from "./snapshot-size.command";
import * as snapshotModule from "./snapshot";
import * as sizeModule from "./snapshot-size";

function makeProgram(): Command {
  const program = new Command();
  program.exitOverride();
  registerSnapshotSizeCommand(program);
  return program;
}

describe("snapshot-size command", () => {
  let consoleSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("size list prints message when no snapshots", async () => {
    jest.spyOn(snapshotModule, "listSnapshots").mockResolvedValue([]);
    const program = makeProgram();
    await program.parseAsync(["node", "test", "size", "list"]);
    expect(consoleSpy).toHaveBeenCalledWith("No snapshots found.");
  });

  it("size list displays table sorted by name by default", async () => {
    jest.spyOn(snapshotModule, "listSnapshots").mockResolvedValue(["beta", "alpha"]);
    jest.spyOn(sizeModule, "summarizeSizes").mockResolvedValue([
      { name: "beta", keyCount: 3, bytes: 200 },
      { name: "alpha", keyCount: 5, bytes: 512 },
    ]);
    const program = makeProgram();
    await program.parseAsync(["node", "test", "size", "list"]);
    const output = consoleSpy.mock.calls.map((c) => c[0]).join("\n");
    const alphaPos = output.indexOf("alpha");
    const betaPos = output.indexOf("beta");
    expect(alphaPos).toBeLessThan(betaPos);
  });

  it("size list supports --sort size", async () => {
    jest.spyOn(snapshotModule, "listSnapshots").mockResolvedValue(["alpha", "beta"]);
    jest.spyOn(sizeModule, "summarizeSizes").mockResolvedValue([
      { name: "alpha", keyCount: 5, bytes: 512 },
      { name: "beta", keyCount: 3, bytes: 200 },
    ]);
    const program = makeProgram();
    await program.parseAsync(["node", "test", "size", "list", "--sort", "size"]);
    const output = consoleSpy.mock.calls.map((c) => c[0]).join("\n");
    const alphaPos = output.indexOf("alpha");
    const betaPos = output.indexOf("beta");
    // alpha (512 bytes) should appear before beta (200 bytes) when sorted desc by size
    expect(alphaPos).toBeLessThan(betaPos);
  });

  it("size show prints details for existing snapshot", async () => {
    jest.spyOn(sizeModule, "measureSnapshot").mockResolvedValue({ name: "mysnap", keyCount: 4, bytes: 1024 });
    const program = makeProgram();
    await program.parseAsync(["node", "test", "size", "show", "mysnap"]);
    const output = consoleSpy.mock.calls.map((c) => c[0]).join("\n");
    expect(output).toContain("mysnap");
    expect(output).toContain("1.0 KB");
    expect(output).toContain("4");
  });

  it("size show exits with error for missing snapshot", async () => {
    jest.spyOn(sizeModule, "measureSnapshot").mockRejectedValue(new Error("not found"));
    const exitSpy = jest.spyOn(process, "exit").mockImplementation(() => { throw new Error("exit"); });
    const program = makeProgram();
    await expect(program.parseAsync(["node", "test", "size", "show", "ghost"])).rejects.toThrow();
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining("ghost"));
    exitSpy.mockRestore();
  });
});
