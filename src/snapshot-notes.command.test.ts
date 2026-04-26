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

describe("notes set", () => {
  it("sets a note for a snapshot", async () => {
    await saveSnapshot("my-snap", { FOO: "bar" });
    const program = makeProgram();
    const logs: string[] = [];
    jest.spyOn(console, "log").mockImplementation((msg) => logs.push(msg));

    await program.parseAsync(["node", "test", "notes", "set", "my-snap", "This is a test note"]);

    expect(logs.some((l) => l.includes("Note saved"))).toBe(true);
    jest.restoreAllMocks();
  });

  it("errors if snapshot does not exist", async () => {
    const program = makeProgram();
    const errors: string[] = [];
    jest.spyOn(console, "error").mockImplementation((msg) => errors.push(msg));

    await program.parseAsync(["node", "test", "notes", "set", "ghost", "some note"]);

    expect(errors.some((e) => e.includes("not found") || e.includes("ghost"))).toBe(true);
    jest.restoreAllMocks();
  });
});

describe("notes get", () => {
  it("retrieves a note for a snapshot", async () => {
    await saveSnapshot("noted-snap", { KEY: "val" });
    const program = makeProgram();

    // Set a note first
    await program.parseAsync(["node", "test", "notes", "set", "noted-snap", "My important note"]);

    const logs: string[] = [];
    jest.spyOn(console, "log").mockImplementation((msg) => logs.push(msg));

    const program2 = makeProgram();
    await program2.parseAsync(["node", "test", "notes", "get", "noted-snap"]);

    expect(logs.some((l) => l.includes("My important note"))).toBe(true);
    jest.restoreAllMocks();
  });

  it("reports no note if none set", async () => {
    await saveSnapshot("bare-snap", { A: "1" });
    const program = makeProgram();
    const logs: string[] = [];
    jest.spyOn(console, "log").mockImplementation((msg) => logs.push(msg));

    await program.parseAsync(["node", "test", "notes", "get", "bare-snap"]);

    expect(logs.some((l) => l.toLowerCase().includes("no note"))).toBe(true);
    jest.restoreAllMocks();
  });
});

describe("notes delete", () => {
  it("deletes a note for a snapshot", async () => {
    await saveSnapshot("del-snap", { X: "y" });
    const p1 = makeProgram();
    await p1.parseAsync(["node", "test", "notes", "set", "del-snap", "Temporary note"]);

    const p2 = makeProgram();
    const logs: string[] = [];
    jest.spyOn(console, "log").mockImplementation((msg) => logs.push(msg));

    await p2.parseAsync(["node", "test", "notes", "delete", "del-snap"]);

    expect(logs.some((l) => l.includes("deleted") || l.includes("removed"))).toBe(true);
    jest.restoreAllMocks();
  });
});

describe("notes list", () => {
  it("lists all snapshots that have notes", async () => {
    await saveSnapshot("snap-a", { A: "1" });
    await saveSnapshot("snap-b", { B: "2" });
    await saveSnapshot("snap-c", { C: "3" });

    const p1 = makeProgram();
    await p1.parseAsync(["node", "test", "notes", "set", "snap-a", "Note for A"]);
    const p2 = makeProgram();
    await p2.parseAsync(["node", "test", "notes", "set", "snap-c", "Note for C"]);

    const logs: string[] = [];
    jest.spyOn(console, "log").mockImplementation((msg) => logs.push(msg));

    const p3 = makeProgram();
    await p3.parseAsync(["node", "test", "notes", "list"]);

    const output = logs.join("\n");
    expect(output).toContain("snap-a");
    expect(output).toContain("snap-c");
    jest.restoreAllMocks();
  });

  it("reports empty when no notes exist", async () => {
    const logs: string[] = [];
    jest.spyOn(console, "log").mockImplementation((msg) => logs.push(msg));

    const program = makeProgram();
    await program.parseAsync(["node", "test", "notes", "list"]);

    expect(logs.some((l) => l.toLowerCase().includes("no notes"))).toBe(true);
    jest.restoreAllMocks();
  });
});
