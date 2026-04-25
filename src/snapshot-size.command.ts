import { Command } from "commander";
import { summarizeSizes, measureSnapshot } from "./snapshot-size";
import { listSnapshots } from "./snapshot";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function registerSnapshotSizeCommand(program: Command): void {
  const sizeCmd = program
    .command("size")
    .description("Show disk usage of snapshots");

  sizeCmd
    .command("list")
    .description("List size of all snapshots")
    .option("--sort <by>", "Sort by: name | size", "name")
    .action(async (opts) => {
      const names = await listSnapshots();
      if (names.length === 0) {
        console.log("No snapshots found.");
        return;
      }
      const sizes = await summarizeSizes(names);
      const sorted = [...sizes];
      if (opts.sort === "size") {
        sorted.sort((a, b) => b.bytes - a.bytes);
      } else {
        sorted.sort((a, b) => a.name.localeCompare(b.name));
      }
      console.log(`\n${ "Snapshot".padEnd(30)} ${ "Keys".padEnd(8)} Size`);
      console.log("-".repeat(52));
      for (const entry of sorted) {
        console.log(
          `${entry.name.padEnd(30)} ${String(entry.keyCount).padEnd(8)} ${formatBytes(entry.bytes)}`
        );
      }
      const total = sorted.reduce((sum, e) => sum + e.bytes, 0);
      console.log("-".repeat(52));
      console.log(`${"Total".padEnd(30)} ${String(sorted.length).padEnd(8)} ${formatBytes(total)}\n`);
    });

  sizeCmd
    .command("show <name>")
    .description("Show size details for a single snapshot")
    .action(async (name: string) => {
      try {
        const result = await measureSnapshot(name);
        console.log(`\nSnapshot : ${result.name}`);
        console.log(`Keys     : ${result.keyCount}`);
        console.log(`Size     : ${formatBytes(result.bytes)}\n`);
      } catch {
        console.error(`Snapshot "${name}" not found.`);
        process.exit(1);
      }
    });
}
