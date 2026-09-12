import { createStore } from "./store";
import type { CoreState } from "./types";

interface CoreShape {
  state: CoreState;
  detail: string;
  level: number; // 0..1 reactive input level
}

export const coreStore = createStore<CoreShape>(null, {
  state: "IDLE",
  detail: "آماده به کار",
  level: 0,
});

export function setCoreState(state: CoreState, detail?: string) {
  coreStore.set((prev) => ({
    ...prev,
    state,
    detail: detail ?? defaultDetail(state),
  }));
}

export function setCoreLevel(level: number) {
  coreStore.set((prev) => ({ ...prev, level: Math.max(0, Math.min(1, level)) }));
}

export function getCoreState(): CoreState {
  return coreStore.get().state;
}

function defaultDetail(state: CoreState) {
  switch (state) {
    case "IDLE":
      return "آماده به کار";
    case "LISTENING":
      return "در حال شنیدن";
    case "THINKING":
      return "در حال پردازش";
    case "SPEAKING":
      return "در حال پاسخ";
    case "ERROR":
      return "خطا در اجرا";
    case "OFFLINE":
      return "بدون اتصال";
  }
}

export const CORE_LABEL: Record<CoreState, string> = {
  IDLE: "آماده",
  LISTENING: "شنیدن",
  THINKING: "پردازش",
  SPEAKING: "پاسخ",
  ERROR: "خطا",
  OFFLINE: "آفلاین",
};
