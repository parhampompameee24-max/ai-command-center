import { createStore } from "./store";
import type { Settings } from "./types";

export const defaultSettings: Settings = {
  assistantName: "جارویس",
  language: "fa-IR",
  voiceURI: "",
  rate: 1,
  pitch: 1,
  autoListen: false,
  soundEffects: true,
  provider: "mock",
  localEndpoint: "http://localhost:11434",
  privileged: false,
};

export const settingsStore = createStore<Settings>("jarvis.settings", defaultSettings);

export function updateSettings(patch: Partial<Settings>) {
  settingsStore.set((prev) => ({ ...prev, ...patch }));
}

export function resetSettings() {
  settingsStore.set({ ...defaultSettings });
}
