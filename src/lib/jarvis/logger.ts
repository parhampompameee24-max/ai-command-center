import { createStore, uid } from "./store";
import type { LogEntry, LogLevel, LogSource } from "./types";

interface LogShape {
  entries: LogEntry[];
}

const MAX = 300;

export const logStore = createStore<LogShape>("jarvis.activity", { entries: [] });

export function log(source: LogSource, message: string, level: LogLevel = "info"): LogEntry {
  const entry: LogEntry = { id: uid(), at: Date.now(), source, level, message };
  logStore.set((prev) => ({ entries: [entry, ...prev.entries].slice(0, MAX) }));
  return entry;
}

export function clearLog() {
  logStore.set({ entries: [] });
}
