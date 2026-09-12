export type CoreState =
  | "IDLE"
  | "LISTENING"
  | "THINKING"
  | "SPEAKING"
  | "ERROR"
  | "OFFLINE";

export type PermissionTier = "PUBLIC" | "SAFE" | "CONFIRM" | "PRIVILEGED" | "BLOCKED";

export type LogLevel = "info" | "success" | "warning" | "error";
export type LogSource = "system" | "voice" | "command" | "ai" | "memory";

export interface LogEntry {
  id: string;
  at: number;
  source: LogSource;
  level: LogLevel;
  message: string;
}

export type MemoryKind = "note" | "fact" | "preference" | "command";

export interface MemoryItem {
  id: string;
  kind: MemoryKind;
  content: string;
  at: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  at: number;
  provider?: string;
  pending?: boolean;
}

export type ProviderId = "mock" | "local" | "cloud";

export interface Settings {
  assistantName: string;
  language: "fa-IR" | "en-US";
  voiceURI: string;
  rate: number;
  pitch: number;
  autoListen: boolean;
  soundEffects: boolean;
  provider: ProviderId;
  localEndpoint: string;
  privileged: boolean;
}

export interface CommandResult {
  ok: boolean;
  output: string;
  tier: PermissionTier;
}
