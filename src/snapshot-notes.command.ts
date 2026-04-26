import { Command } from "commander";
import { setNote, getNote, deleteNote, listNotes } from "./snapshot-notes";

/**
 * Registers the `notes` subcommand group onto the given CLI program.
 *
 * Commands:
 *   notes set <snapshot> <text>   – attach a note to a snapshot
 *   notes get <snapshot>          – print the note for a snapshot
 *   notes delete <snapshot>       – remove the note from a snapshot
 *   notes list                    – list all snapshots that have notes
 */
export function registerSnapshotNotesCommand(program: Command): void {
  const notes = program
    .command("notes")
    .description("manage notes attached to snapshots");

  // ── notes set ────────────────────────────────────────────────────────────
  notes
    .command("set <snapshot> <text>")
    .description("attach or update a note for a snapshot")
    .action((snapshot: string, text: string) => {
      try {
        setNote(snapshot, text);
        console.log(`Note saved for snapshot "${snapshot}".`);
      } catch (err) {
        console.error(
          `Error saving note: ${err instanceof Error ? err.message : err}`
        );
        process.exit(1);
      }
    });

  // ── notes get ────────────────────────────────────────────────────────────
  notes
    .command("get <snapshot>")
    .description("print the note attached to a snapshot")
    .action((snapshot: string) => {
      try {
        const note = getNote(snapshot);
        if (note === undefined) {
          console.log(`No note found for snapshot "${snapshot}".`);
        } else {
          console.log(note);
        }
      } catch (err) {
        console.error(
          `Error reading note: ${err instanceof Error ? err.message : err}`
        );
        process.exit(1);
      }
    });

  // ── notes delete ─────────────────────────────────────────────────────────
  notes
    .command("delete <snapshot>")
    .description("remove the note attached to a snapshot")
    .action((snapshot: string) => {
      try {
        const removed = deleteNote(snapshot);
        if (removed) {
          console.log(`Note removed for snapshot "${snapshot}".`);
        } else {
          console.log(`No note found for snapshot "${snapshot}".`);
        }
      } catch (err) {
        console.error(
          `Error deleting note: ${err instanceof Error ? err.message : err}`
        );
        process.exit(1);
      }
    });

  // ── notes list ───────────────────────────────────────────────────────────
  notes
    .command("list")
    .description("list all snapshots that have notes")
    .action(() => {
      try {
        const entries = listNotes();
        if (entries.length === 0) {
          console.log("No notes found.");
          return;
        }
        const nameWidth = Math.max(
          8,
          ...entries.map(([name]) => name.length)
        );
        console.log(
          `${"SNAPSHOT".padEnd(nameWidth)}  NOTE`
        );
        console.log("-".repeat(nameWidth + 2 + 40));
        for (const [name, note] of entries) {
          const preview =
            note.length > 60 ? note.slice(0, 57) + "..." : note;
          console.log(`${name.padEnd(nameWidth)}  ${preview}`);
        }
      } catch (err) {
        console.error(
          `Error listing notes: ${err instanceof Error ? err.message : err}`
        );
        process.exit(1);
      }
    });
}
