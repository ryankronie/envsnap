import { Command } from "commander";
import fs from "fs";
import path from "path";
import os from "os";
import { registerSnapshotNotesCommand } from "./snapshot-notes.command";
import { saveSnapshot } from "./snapshot";

let tmpDir: string;

function makeProgram(): Command {
  const program = new Command();
  program.exitOverride();
  registerSnapshotNotesCommand(program);
  return program;
}

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "envsnap-notes-cmd-"));
  process.env.ENVSNAP_DIR = tmpDir;
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
  delete process.env.ENVSNAP_DIR;
});

/** Helper to capture console.log output during a program.parseAsync call */
async function captureLog(fn: () => Promise<void>): Promise<string[]> {
  const logs: string[] = [];
  jest.spyOn(console, "log").mockImplementation((msg) => logs.push(msg));
  await fn();
  jest.restoreAllMocks();
  return logs;
}

/** Helper to capture console.error output during a program.parseAsync call */
async function captureError(fn: () => Promise<void>): Promise<string[]> {
  const errors: string[] = [];
  jest.spyOn(console, "error").mockImplementation((msg) => errors.push(msg));
  await fn();
  jest.restoreAllMocks();
  return errors;
}

describe("notes set", () => {
  it("sets a note for a snapshot", async () => {
    await saveSnapshot("my-snap", { FOO: "bar" });
    const program = makeProgram();

    const logs = await captureLog(() =>
      program.parseAsync(["node", "test", "notes", "set", "my-snap", "This is a test note"])
    );

    expect(logs.some((l) => l.includes("Note saved"))).toBe(true);
  });

  it("errors if snapshot does not exist", async () => {
    const program = makeProgram();

    const errors = await captureError(() =>
      program.parseAsync(["node", "test", "notes", "set", "ghost", "some note"])
    );

    expect(errors.some((e) => e.includes("not found") || e.includes("ghost"))).toBe(true);
  });
});

describe("notes get", () => {
  it("retrieves a note for a snapshot", async () => {
    await saveSnapshot("noted-snap", { KEY: "val" });
    const program = makeProgram();

    // Set a note first
    await program.parseAsync(["node", "test", "notes", "set", "noted-snap", "My important note"]);

    const program2 = makeProgram();
    const logs = await captureLog(() =>
      program2.parseAsync(["node", "test", "notes", "get", "noted-snap"])
    );

    expect(logs.some((l) => l.includes("My important note"))).toBe(true);
  });

  it("reports no note if none set", async () => {
    await saveSnapshot("bare-snap", { A: "1" });
    const program = makeProgram();

    const logs = await captureLog(() =>
      program.parseAsync(["node", "test", "notes", "get", "bare-snap"])
    );

    expect(logs.some((l) => l.toLowerCase().includes("no note"))).toBe(true);
  });
});

describe("notes delete", () => {
  it("deletes a note for a snapshot", async () => {
    await saveSnapshot("del-snap", { X: "y" });
    const p1 = makeProgram();
    await p1.parseAsync(["node", "test", "notes", "set", "del-snap", "Temporary note"]);

    const p2 = makeProgram();
    const logs = await captureLog(() =>
      p2.parseAsync(["node", "test", "notes", "delete", "del-snap"])
    );

    expect(logs.some((l) => l.toLowerCase().includes("deleted") || l.toLowerCase().includes("removed"))).toBe(true);
  });
});
