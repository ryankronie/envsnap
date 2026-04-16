import { DiffEntry } from './diff';

const RESET = '\x1b[0m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const BOLD = '\x1b[1m';

function maskValue(value: string): string {
  if (value.length <= 4) return '****';
  return value.slice(0, 2) + '*'.repeat(value.length - 4) + value.slice(-2);
}

export function formatDiff(entries: DiffEntry[], mask = true): string {
  if (entries.length === 0) return `${BOLD}No differences found.${RESET}`;

  const lines: string[] = [];

  for (const entry of entries) {
    const display = (v: string) => (mask ? maskValue(v) : v);

    if (entry.status === 'added') {
      lines.push(`${GREEN}+ ${entry.key}=${display(entry.newValue!)}${RESET}`);
    } else if (entry.status === 'removed') {
      lines.push(`${RED}- ${entry.key}=${display(entry.oldValue!)}${RESET}`);
    } else if (entry.status === 'changed') {
      lines.push(`${YELLOW}~ ${entry.key}: ${display(entry.oldValue!)} → ${display(entry.newValue!)}${RESET}`);
    }
  }

  return lines.join('\n');
}

export function formatSummary(entries: DiffEntry[]): string {
  const added = entries.filter(e => e.status === 'added').length;
  const removed = entries.filter(e => e.status === 'removed').length;
  const changed = entries.filter(e => e.status === 'changed').length;
  return `${GREEN}+${added}${RESET} added, ${RED}-${removed}${RESET} removed, ${YELLOW}~${changed}${RESET} changed`;
}
