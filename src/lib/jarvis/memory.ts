import { createStore, uid } from "./store";
import type { MemoryItem, MemoryKind } from "./types";

interface MemoryShape {
  items: MemoryItem[];
}

export const memoryStore = createStore<MemoryShape>("jarvis.memory", { items: [] });

export function remember(kind: MemoryKind, content: string): MemoryItem {
  const item: MemoryItem = { id: uid(), kind, content, at: Date.now() };
  memoryStore.set((prev) => ({ items: [item, ...prev.items].slice(0, 500) }));
  return item;
}

export function editMemory(id: string, content: string) {
  memoryStore.set((prev) => ({
    items: prev.items.map((i) => (i.id === id ? { ...i, content } : i)),
  }));
}

export function forget(id: string) {
  memoryStore.set((prev) => ({ items: prev.items.filter((i) => i.id !== id) }));
}

export function clearMemory(kind?: MemoryKind) {
  memoryStore.set((prev) => ({
    items: kind ? prev.items.filter((i) => i.kind !== kind) : [],
  }));
}

export function searchMemory(query: string, kind?: MemoryKind | "all") {
  const q = query.trim().toLowerCase();
  return memoryStore
    .get()
    .items.filter((i) => (!kind || kind === "all" ? true : i.kind === kind))
    .filter((i) => (q ? i.content.toLowerCase().includes(q) : true));
}

export const MEMORY_LABEL: Record<MemoryKind, string> = {
  note: "یادداشت",
  fact: "دانسته",
  preference: "ترجیح",
  command: "فرمان",
};
